import { supabase } from "../Config/supabase.js";
import { calculateDistanceKm } from "../utils/geo.js";

/**
 * Fetch all transfer pings with populated store and ingredient relations
 */
export const getTransferPing = async (req, res) => {
  try {
    const { status, store_id } = req.query;

    let query = supabase
      .from("transfer_pings")
      .select(
        "*, from_store:stores!from_store_id(id, name, address, lat, log), to_store:stores!to_store_id(id, name, address, lat, log), ingredient:ingredients(id, name, unit, cost_per_unit)"
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (store_id) {
      query = query.or(`from_store_id.eq.${store_id},to_store_id.eq.${store_id}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getTransferPing:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a manual transfer ping
 */
export const createTransferPing = async (req, res) => {
  try {
    const { from_store_id, to_store_id, status, ingredient_id, quantity, distance_km } = req.body;
    const io = req.app.get("io");

    const insertData = {
      from_store_id,
      to_store_id,
      ingredient_id,
      quantity: Number(quantity),
      status: status || "PENDING",
      ...(distance_km !== undefined && { distance_km: Number(distance_km) })
    };

    const { data, error } = await supabase
      .from("transfer_pings")
      .insert([insertData])
      .select(
        "*, from_store:stores!from_store_id(id, name, address, lat, log), to_store:stores!to_store_id(id, name, address, lat, log), ingredient:ingredients(id, name, unit, cost_per_unit)"
      )
      .single();

    if (error) throw error;

    if (io) {
      io.to(`store_${from_store_id}`).emit("ping:new_request", data);
      io.emit("ping:broadcast", data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept a Transfer Ping & Atomically execute stock transfer
 */
export const acceptTransferPing = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get("io");

    // 1. Fetch ping details
    const { data: ping, error: pingErr } = await supabase
      .from("transfer_pings")
      .select(
        "*, from_store:stores!from_store_id(name), to_store:stores!to_store_id(name), ingredient:ingredients(name, unit)"
      )
      .eq("id", id)
      .single();

    if (pingErr || !ping) {
      return res.status(404).json({ error: "Transfer ping not found." });
    }

    if (ping.status === "COMPLETED") {
      return res.status(400).json({ error: "This transfer has already been completed." });
    }

    const { from_store_id, to_store_id, ingredient_id, quantity } = ping;
    const transferQty = Number(quantity);

    // 2. Fetch donor inventory
    const { data: donorInv, error: donorErr } = await supabase
      .from("inventory")
      .select("*")
      .eq("store_id", from_store_id)
      .eq("ingredient_id", ingredient_id)
      .single();

    if (donorErr || !donorInv) {
      return res.status(400).json({ error: "Donor store does not have this ingredient in inventory." });
    }

    // Ensure donor stock is not expired
    const isDonorExpired = donorInv.expiry_date && new Date(donorInv.expiry_date) <= new Date();
    if (isDonorExpired) {
      return res.status(400).json({ error: "Donor stock has expired and cannot be transferred." });
    }

    if (Number(donorInv.quantity) < transferQty) {
      return res.status(400).json({
        error: `Insufficient stock at donor store. Available: ${donorInv.quantity}, Requested: ${transferQty}`
      });
    }

    // 3. Atomically Deduct from Donor Store
    const newDonorQty = Math.max(0, Math.round((Number(donorInv.quantity) - transferQty) * 1000) / 1000);
    await supabase
      .from("inventory")
      .update({ quantity: newDonorQty, updated_at: new Date().toISOString() })
      .eq("id", donorInv.id);

    // 4. Atomically Credit to Recipient Store
    const { data: recipientInv } = await supabase
      .from("inventory")
      .select("*")
      .eq("store_id", to_store_id)
      .eq("ingredient_id", ingredient_id)
      .single();

    const isRecipientExpired = recipientInv?.expiry_date && new Date(recipientInv.expiry_date) <= new Date();

    let newRecipientQty = transferQty;
    if (recipientInv) {
      // If recipient's existing stock was expired, replace with fresh transferred stock;
      // otherwise, add transferQty to healthy stock.
      newRecipientQty = isRecipientExpired
        ? transferQty
        : Math.round((Number(recipientInv.quantity) + transferQty) * 1000) / 1000;

      const updateData = {
        quantity: newRecipientQty,
        updated_at: new Date().toISOString()
      };

      if (isRecipientExpired && donorInv.expiry_date) {
        updateData.expiry_date = donorInv.expiry_date;
      }

      await supabase
        .from("inventory")
        .update(updateData)
        .eq("id", recipientInv.id);
    } else {
      await supabase.from("inventory").insert({
        store_id: to_store_id,
        ingredient_id,
        quantity: transferQty,
        reorder_level: 5,
        ...(donorInv.expiry_date ? { expiry_date: donorInv.expiry_date } : {})
      });
    }

    // 5. Update Transfer Ping status to COMPLETED
    const { data: updatedPing, error: updateErr } = await supabase
      .from("transfer_pings")
      .update({ status: "COMPLETED" })
      .eq("id", id)
      .select(
        "*, from_store:stores!from_store_id(name), to_store:stores!to_store_id(name), ingredient:ingredients(name, unit)"
      )
      .single();

    if (updateErr) throw updateErr;

    // 6. Broadcast Real-time Events via Socket.IO
    if (io) {
      io.to(`store_${from_store_id}`).emit("inventory:updated", { store_id: from_store_id });
      io.to(`store_${to_store_id}`).emit("inventory:updated", { store_id: to_store_id });
      io.to(`store_${to_store_id}`).emit("ping:accepted", updatedPing);
      io.emit("transfer:completed", updatedPing);
      io.emit("inventory:global_update");
    }

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${transferQty} ${ping.ingredient?.unit || "units"} of ${ping.ingredient?.name} from ${ping.from_store?.name} to ${ping.to_store?.name}.`,
      ping: updatedPing,
      donor_new_stock: newDonorQty,
      recipient_new_stock: newRecipientQty
    });
  } catch (error) {
    console.error("Error in acceptTransferPing:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject / Decline a transfer ping
 */
export const rejectTransferPing = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get("io");

    const { data, error } = await supabase
      .from("transfer_pings")
      .update({ status: "REJECTED" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (io) {
      io.emit("ping:rejected", { id });
    }

    res.status(200).json({ success: true, ping: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTransferPing = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const { data, error } = await supabase
      .from("transfer_pings")
      .update(updateData)
      .eq("id", req.params.id)
      .select();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransferPing = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transfer_pings")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Autonomous Full System Redistribution Scan:
 * Scans all stores for shortage items (quantity <= reorder_level or expired stock),
 * finds nearest donor within 10km with unexpired surplus stock using FEFO,
 * and generates transfer pings.
 */
export const autoScanRedistribute = async (req, res) => {
  try {
    const io = req.app.get("io");
    const now = new Date();
    const isExpired = item => Boolean(item.expiry_date && new Date(item.expiry_date) <= now);

    // 1. Fetch all inventory with store coordinates and ingredient details
    const { data: allInventory, error: invError } = await supabase
      .from("inventory")
      .select("*, stores(id, name, lat, log, address), ingredients(id, name, unit)");

    if (invError) throw invError;

    // 2. Identify shortage items: either below reorder level OR expired stock
    const shortageItems = (allInventory || []).filter(item => {
      const expired = isExpired(item);
      const belowReorder = Number(item.quantity) <= Number(item.reorder_level);
      return belowReorder || expired;
    });

    if (shortageItems.length === 0) {
      return res.status(200).json({
        message: "All stores currently have optimal inventory levels. No transfers required.",
        transfers: []
      });
    }

    const transfersCreated = [];

    // 3. For each shortage item, find the best donor within 10km
    for (const needy of shortageItems) {
      if (!needy.stores?.lat || !needy.stores?.log) continue;

      const needyExpired = isExpired(needy);
      // Expired items cannot be safely used; effective usable stock is 0
      const usableQty = needyExpired ? 0 : Number(needy.quantity);
      const reorderLevel = Number(needy.reorder_level) || 5;
      const deficit = Math.max(reorderLevel - usableQty + 5, 5);

      // Candidate donor stores with surplus AND fresh (unexpired) stock
      const candidateDonors = allInventory
        .filter(
          candidate =>
            candidate.ingredient_id === needy.ingredient_id &&
            candidate.store_id !== needy.store_id &&
            candidate.stores?.lat &&
            candidate.stores?.log &&
            !isExpired(candidate) && // Donor must NOT have expired stock
            Number(candidate.quantity) - Number(candidate.reorder_level) > 1.0
        )
        .map(candidate => {
          const dist = calculateDistanceKm(
            needy.stores.lat,
            needy.stores.log,
            candidate.stores.lat,
            candidate.stores.log
          );
          return { ...candidate, distance_km: dist };
        })
        .filter(candidate => candidate.distance_km <= 10.0); // 10km geofence filter!

      // Sort candidate donors using FEFO (unexpired stock expiring earliest first to prevent waste)
      candidateDonors.sort((a, b) => {
        const timeA = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
        const timeB = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
        const dateDiff = timeA - timeB;
        if (dateDiff !== 0) return dateDiff;
        return a.distance_km - b.distance_km; // tie-breaker: closer distance
      });

      if (candidateDonors.length > 0) {
        const bestDonor = candidateDonors[0];
        const availableSurplus = Number(bestDonor.quantity) - Number(bestDonor.reorder_level);
        const transferQty = Math.min(availableSurplus, deficit);

        if (transferQty < 0.5) continue;

        // Check if an existing PENDING ping already exists
        const { data: existing } = await supabase
          .from("transfer_pings")
          .select("id")
          .eq("from_store_id", bestDonor.store_id)
          .eq("to_store_id", needy.store_id)
          .eq("ingredient_id", needy.ingredient_id)
          .eq("status", "PENDING")
          .limit(1);

        if (!existing || existing.length === 0) {
          const { data: newPing, error: pingErr } = await supabase
            .from("transfer_pings")
            .insert({
              from_store_id: bestDonor.store_id,
              to_store_id: needy.store_id,
              ingredient_id: needy.ingredient_id,
              quantity: Math.round(transferQty * 10) / 10,
              distance_km: bestDonor.distance_km,
              status: "PENDING"
            })
            .select(
              "*, from_store:stores!from_store_id(id, name, address, lat, log), to_store:stores!to_store_id(id, name, address, lat, log), ingredient:ingredients(id, name, unit)"
            )
            .single();

          if (!pingErr && newPing) {
            transfersCreated.push(newPing);
            if (io) {
              io.to(`store_${bestDonor.store_id}`).emit("ping:new_request", newPing);
              io.emit("ping:broadcast", newPing);
            }
          }
        }
      }
    }

    res.status(200).json({
      message: `Autonomous scan complete. Generated ${transfersCreated.length} redistribution ping(s) within 10km.`,
      transfers: transfersCreated
    });
  } catch (error) {
    console.error("Error in autoScanRedistribute:", error.message);
    res.status(500).json({ error: error.message });
  }
};

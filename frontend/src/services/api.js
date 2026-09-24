const API_BASE = '/api';

export const api = {
  // Stores
  async getStores() {
    const res = await fetch(`${API_BASE}/stores`);
    if (!res.ok) throw new Error('Failed to fetch stores');
    return res.json();
  },

  // Menu items
  async getMenuItems() {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return res.json();
  },

  // Recipes (Bill of Materials)
  async getRecipes() {
    const res = await fetch(`${API_BASE}/recipes`);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    return res.json();
  },

  // Store Inventory
  async getInventory(storeId) {
    const url = storeId ? `${API_BASE}/inventory?store_id=${storeId}` : `${API_BASE}/inventory`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  // Transfer Pings
  async getTransferPings(storeId, status) {
    let url = `${API_BASE}/transfer?`;
    if (storeId) url += `store_id=${storeId}&`;
    if (status) url += `status=${status}&`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch transfer pings');
    return res.json();
  },

  // Accept Transfer Ping & Execute Stock Transfer
  async acceptTransfer(pingId) {
    const res = await fetch(`${API_BASE}/transfer/${pingId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to accept transfer');
    }
    return res.json();
  },

  // Reject Transfer Ping
  async rejectTransfer(pingId) {
    const res = await fetch(`${API_BASE}/transfer/${pingId}/reject`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reject transfer');
    return res.json();
  },

  // Place POS Customer Order
  async placeOrder(storeId, items) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: storeId, items })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  // Trigger Autonomous Redistribution Scan
  async triggerScan() {
    const res = await fetch(`${API_BASE}/transfer/scan`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger scan');
    return res.json();
  },

  // Analytics & ESG Dashboard
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }
};

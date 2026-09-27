import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import POSSimulator from './components/POSSimulator';
import ManagerDashboard from './components/ManagerDashboard';
import ESGAnalytics from './components/ESGAnalytics';
import PingAlertModal from './components/PingAlertModal';
import { api } from './services/api';
import { socket, joinStoreRoom, leaveStoreRoom } from './services/socket';

export default function App() {
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transferPings, setTransferPings] = useState([]);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'manager' | 'analytics'
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [incomingPingAlert, setIncomingPingAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Data Fetching
  const loadInitialData = async () => {
    try {
      const [storesData, menuData, recipesData, pingsData] = await Promise.all([
        api.getStores(),
        api.getMenuItems(),
        api.getRecipes(),
        api.getTransferPings()
      ]);

      setStores(storesData || []);
      setMenuItems(menuData || []);
      setRecipes(recipesData || []);
      setTransferPings(pingsData || []);

      if (storesData && storesData.length > 0 && !activeStore) {
        setActiveStore(storesData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial system data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Fetch inventory whenever activeStore changes
  const loadStoreInventory = useCallback(async (storeId) => {
    if (!storeId) return;
    try {
      const invData = await api.getInventory(storeId);
      setInventory(invData || []);
    } catch (err) {
      console.error('Failed to fetch store inventory:', err);
    }
  }, []);

  useEffect(() => {
    if (activeStore?.id) {
      loadStoreInventory(activeStore.id);
      joinStoreRoom(activeStore.id);

      return () => {
        leaveStoreRoom(activeStore.id);
      };
    }
  }, [activeStore?.id, loadStoreInventory]);

  // 3. Socket.IO Real-time Pipeline
  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Connected to Socket.IO engine');
      setSocketConnected(true);
      if (activeStore?.id) joinStoreRoom(activeStore.id);
    };

    const onDisconnect = () => {
      console.log('❌ Disconnected from Socket.IO engine');
      setSocketConnected(false);
    };

    const onInventoryUpdate = (data) => {
      console.log('📦 Real-time Inventory Updated:', data);
      if (activeStore?.id) {
        loadStoreInventory(activeStore.id);
      }
    };

    const onPingNewRequest = (newPing) => {
      console.log('🚨 Incoming Real-Time Transfer Ping:', newPing);
      // Refresh transfer pings list
      api.getTransferPings().then(p => setTransferPings(p || []));

      // If active store is the donor, display high-priority popup alert!
      if (activeStore && newPing.from_store_id === activeStore.id) {
        setIncomingPingAlert(newPing);
      }
    };

    const onTransferCompleted = (transfer) => {
      console.log('🎉 Transfer Completed:', transfer);
      api.getTransferPings().then(p => setTransferPings(p || []));
      if (activeStore?.id) {
        loadStoreInventory(activeStore.id);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('inventory:updated', onInventoryUpdate);
    socket.on('inventory:global_update', onInventoryUpdate);
    socket.on('ping:new_request', onPingNewRequest);
    socket.on('ping:broadcast', () => {
      api.getTransferPings().then(p => setTransferPings(p || []));
    });
    socket.on('transfer:completed', onTransferCompleted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('inventory:updated', onInventoryUpdate);
      socket.off('inventory:global_update', onInventoryUpdate);
      socket.off('ping:new_request', onPingNewRequest);
      socket.off('ping:broadcast');
      socket.off('transfer:completed', onTransferCompleted);
    };
  }, [activeStore, loadStoreInventory]);

  // Count pending pings relevant to active store
  const pendingPingsCount = transferPings.filter(
    p => p.status === 'PENDING' && (p.from_store_id === activeStore?.id || p.to_store_id === activeStore?.id)
  ).length;

  const refreshAll = () => {
    if (activeStore?.id) loadStoreInventory(activeStore.id);
    api.getTransferPings().then(p => setTransferPings(p || []));
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--color-parchment)' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--color-stone)', borderTopColor: 'var(--color-ink)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: '13px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)' }}>
          Connecting to Autonomous Kitchen Network...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Application Header */}
      <Header
        stores={stores}
        activeStore={activeStore}
        onSelectStore={(store) => setActiveStore(store)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        socketConnected={socketConnected}
        pendingPingsCount={pendingPingsCount}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'pos' && (
          <POSSimulator
            menuItems={menuItems}
            recipes={recipes}
            inventory={inventory}
            activeStore={activeStore}
            onOrderSuccess={refreshAll}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerDashboard
            activeStore={activeStore}
            stores={stores}
            inventory={inventory}
            transferPings={transferPings}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === 'analytics' && (
          <ESGAnalytics />
        )}
      </main>

      {/* Real-time Emergency Ping Notification Modal */}
      <PingAlertModal
        ping={incomingPingAlert}
        onClose={() => setIncomingPingAlert(null)}
        onAccepted={() => {
          refreshAll();
          setIncomingPingAlert(null);
        }}
      />

    </div>
  );
}

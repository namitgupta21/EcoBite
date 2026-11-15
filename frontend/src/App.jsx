import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import POSSimulator from './components/POSSimulator';
import ManagerDashboard from './components/ManagerDashboard';
import ESGAnalytics from './components/ESGAnalytics';
import PingAlertModal from './components/PingAlertModal';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { api } from './services/api';
import { socket, joinStoreRoom, leaveStoreRoom } from './services/socket';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  const [currentView, setCurrentView] = useState(() => {
    const user = api.getCurrentUser();
    return user ? 'app' : 'landing';
  });
  const [stores, setStores] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transferPings, setTransferPings] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    const user = api.getCurrentUser();
    return user?.role === 'manager' ? 'manager' : 'pos';
  });
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [incomingPingAlert, setIncomingPingAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 1. Initial Data Fetching
  const loadInitialData = async () => {
    setLoading(true);
    setLoadError(null);
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
      setLoadError(err.message || 'Failed to connect to backend server');
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
      api.getTransferPings().then(p => setTransferPings(p || []));

      // Display high-priority popup alert ONLY if user is a manager and active store is donor
      if (currentUser?.role === 'manager' && activeStore && newPing.from_store_id === activeStore.id) {
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
  }, [activeStore, currentUser?.role, loadStoreInventory]);

  // Role-based authentication handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'manager') {
      setActiveTab('manager');
    } else {
      setActiveTab('pos');
    }
    setCurrentView('app');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIncomingPingAlert(null);
    setActiveTab('pos');
    setCurrentView('landing');
  };

  // Tab switching handler
  const handleSelectTab = (tab) => {
    if (currentUser?.role === 'manager') {
      // Manager can only toggle between manager and analytics
      if (tab === 'manager' || tab === 'analytics') {
        setActiveTab(tab);
      }
    } else {
      // Customer is locked to POS
      setActiveTab('pos');
    }
  };

  // Count pending pings relevant to active store
  const pendingPingsCount = transferPings.filter(
    p => p.status === 'PENDING' && (p.from_store_id === activeStore?.id || p.to_store_id === activeStore?.id)
  ).length;

  const refreshAll = () => {
    if (activeStore?.id) loadStoreInventory(activeStore.id);
    api.getTransferPings().then(p => setTransferPings(p || []));
  };

  // 1. Landing Page View (accessible to both logged out visitors and logged in operators)
  if (currentView === 'landing') {
    return (
      <LandingPage
        currentUser={currentUser}
        onLaunchApp={() => {
          if (currentUser) {
            setCurrentView('app');
          } else {
            setCurrentView('login');
          }
        }}
        onOpenLogin={() => setCurrentView('login')}
        onLogout={handleLogout}
      />
    );
  }

  // 2. Authentication Login Page View
  if (currentView === 'login' || !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

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

  const isManager = currentUser?.role === 'manager';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Global Application Header */}
      <Header
        stores={stores}
        activeStore={activeStore}
        onSelectStore={(store) => setActiveStore(store)}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        socketConnected={socketConnected}
        pendingPingsCount={pendingPingsCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoLanding={() => setCurrentView('landing')}
      />

      {/* Backend Connection Diagnostics Banner */}
      {loadError && (
        <div style={{
          maxWidth: 'var(--page-max-width)',
          margin: '16px auto 0',
          padding: '0 24px',
          width: '100%'
        }}>
          <div className="card-bone" style={{
            padding: '16px 20px',
            border: '1px solid var(--color-crimson)',
            background: 'rgba(207, 45, 86, 0.05)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-crimson)', fontWeight: 500, fontSize: '14px' }}>
                  <span>⚠️</span>
                  <span>Backend Service Connection Issue</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink)', marginTop: '4px', lineHeight: 1.4 }}>
                  {loadError}
                </p>
                <div style={{ fontSize: '11px', color: 'var(--color-driftwood)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                  Target Backend: <strong>{api.getBackendUrl() || '(Empty — please configure VITE_BACKEND_URL in Vercel settings and redeploy)'}</strong>
                </div>
              </div>

              <button
                onClick={loadInitialData}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Content - Role-Segregated Views */}
      <main style={{ flex: 1, minWidth: 0, width: '100%', maxWidth: '100%' }}>
        {/* Customer View: Strictly POS Terminal */}
        {!isManager && (
          <POSSimulator
            menuItems={menuItems}
            recipes={recipes}
            inventory={inventory}
            activeStore={activeStore}
            onOrderSuccess={refreshAll}
          />
        )}

        {/* Manager View: Strictly 10km Radar & Manager Dashboard and ESG Analytics */}
        {isManager && activeTab === 'manager' && (
          <ManagerDashboard
            activeStore={activeStore}
            stores={stores}
            inventory={inventory}
            transferPings={transferPings}
            onRefresh={refreshAll}
          />
        )}

        {isManager && activeTab === 'analytics' && (
          <ESGAnalytics />
        )}
      </main>

      {/* Real-time Emergency Ping Notification Modal (Only visible to authenticated managers) */}
      {isManager && (
        <PingAlertModal
          ping={incomingPingAlert}
          onClose={() => setIncomingPingAlert(null)}
          onAccepted={() => {
            refreshAll();
            setIncomingPingAlert(null);
          }}
        />
      )}

    </div>
  );
}

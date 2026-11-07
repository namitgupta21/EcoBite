const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
const API_BASE = `${BACKEND_URL}/api`;

const AUTH_USER_KEY = 'autonomous_kitchen_user';
const AUTH_TOKEN_KEY = 'autonomous_kitchen_token';
const LOCAL_USERS_DB_KEY = 'autonomous_kitchen_local_users';

async function fetchJson(url, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    ...(options.headers || {})
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    if (contentType.includes('text/html')) {
      throw new Error(
        `Backend not reached: received HTML from ${url}. Verify VITE_BACKEND_URL is configured in Vercel settings and redeployed.`
      );
    }
    throw new Error(`Unexpected response format from ${url}`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Backend config debug helper
  getBackendUrl() {
    return BACKEND_URL;
  },

  // Authentication Helpers
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Customer Self-Service Registration (Database Persistence)
  async signup({ name, username, email, password, phone }) {
    const cleanName = String(name || '').trim();
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPassword = String(password || '').trim();

    try {
      const res = await fetchJson(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword,
          phone: phone || null
        })
      });

      if (res?.success && res.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token || `auth_token_${Date.now()}`);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
    } catch (err) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('required'))) {
        throw err;
      }
      console.warn('Backend signup unreachable, storing in local customer registry fallback:', err.message);
    }

    // Offline / Cold-start fallback
    try {
      const storedUsersRaw = localStorage.getItem(LOCAL_USERS_DB_KEY);
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];

      if (storedUsers.some(u => u.username === cleanUsername || (cleanEmail && u.email === cleanEmail))) {
        throw new Error('An account with that username or email already exists.');
      }

      const newCustomer = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        role: 'customer'
      };

      storedUsers.push(newCustomer);
      localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(storedUsers));
      localStorage.setItem(AUTH_TOKEN_KEY, `auth_token_cust_${Date.now()}`);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newCustomer));
      return { success: true, user: newCustomer };
    } catch (e) {
      throw new Error(e.message || 'Registration failed.');
    }
  },

  // User Sign-In (Database Retrieval)
  async login({ id, username, password }) {
    const loginId = String(id || username || '').trim();
    const inputPass = String(password || '').trim();

    // 1. Attempt verification via backend API (Supabase DB)
    try {
      const res = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId, password: inputPass })
      });

      if (res?.success && res.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token || `auth_token_${Date.now()}`);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('not found'))) {
        throw err;
      }
      console.warn('Backend auth endpoint unreachable, checking local credentials fallback:', err.message);
    }

    // 2. Client-side fallback if backend is sleeping or offline
    const lowerId = loginId.toLowerCase();

    // Check newly registered customers in local storage
    try {
      const storedUsersRaw = localStorage.getItem(LOCAL_USERS_DB_KEY);
      if (storedUsersRaw) {
        const storedUsers = JSON.parse(storedUsersRaw);
        const match = storedUsers.find(u => 
          (u.username === lowerId || u.email === lowerId) && u.password === inputPass
        );
        if (match) {
          localStorage.setItem(AUTH_TOKEN_KEY, `auth_token_cust_${Date.now()}`);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(match));
          return { success: true, user: match };
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Default seeded accounts
    if (lowerId === 'customer' && (inputPass === 'customer123' || inputPass === 'password')) {
      const customerUser = {
        id: 'customer',
        username: 'customer',
        name: 'Alex Rivera',
        role: 'customer',
        description: 'Registered Diner'
      };
      localStorage.setItem(AUTH_TOKEN_KEY, `auth_token_customer_${Date.now()}`);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(customerUser));
      return { success: true, user: customerUser };
    }

    if ((lowerId === 'manager' || lowerId === 'admin') && 
        (inputPass === 'manager123' || inputPass === 'admin123' || inputPass === '1234')) {
      const managerUser = {
        id: 'manager',
        username: 'manager',
        name: 'Franchise Store Manager',
        role: 'manager',
        description: 'Operations & Redistribution Manager'
      };
      localStorage.setItem(AUTH_TOKEN_KEY, `auth_token_manager_${Date.now()}`);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(managerUser));
      return { success: true, user: managerUser };
    }

    throw new Error('Invalid User ID or Password. User not found in database.');
  },

  loginAsGuest() {
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 7),
      username: 'guest',
      name: 'Guest Diner',
      role: 'customer',
      isGuest: true
    };
    localStorage.setItem(AUTH_TOKEN_KEY, `auth_token_guest_${Date.now()}`);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  // Stores
  async getStores() {
    return fetchJson(`${API_BASE}/stores`);
  },

  // Menu items
  async getMenuItems() {
    return fetchJson(`${API_BASE}/menu`);
  },

  // Recipes (Bill of Materials)
  async getRecipes() {
    return fetchJson(`${API_BASE}/recipes`);
  },

  // Store Inventory
  async getInventory(storeId) {
    const url = storeId ? `${API_BASE}/inventory?store_id=${storeId}` : `${API_BASE}/inventory`;
    return fetchJson(url);
  },

  // Transfer Pings
  async getTransferPings(storeId, status) {
    let url = `${API_BASE}/transfer?`;
    if (storeId) url += `store_id=${storeId}&`;
    if (status) url += `status=${status}&`;
    return fetchJson(url);
  },

  // Accept Transfer Ping & Execute Stock Transfer
  async acceptTransfer(pingId) {
    return fetchJson(`${API_BASE}/transfer/${pingId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Reject Transfer Ping
  async rejectTransfer(pingId) {
    return fetchJson(`${API_BASE}/transfer/${pingId}/reject`, {
      method: 'POST'
    });
  },

  // Place POS Customer Order
  async placeOrder(storeId, items) {
    return fetchJson(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: storeId, items })
    });
  },

  // Trigger Autonomous Redistribution Scan
  async triggerScan() {
    return fetchJson(`${API_BASE}/transfer/scan`, {
      method: 'POST'
    });
  },

  // Analytics & ESG Dashboard
  async getAnalytics() {
    return fetchJson(`${API_BASE}/analytics`);
  }
};

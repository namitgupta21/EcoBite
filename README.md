# 🍔 Autonomous Inventory Redistribution System
### Real-Time Micro-Ingredient Tracking & 10km FEFO Geospatial Redistribution

Welcome to the **Autonomous Inventory Redistribution System**! This platform solves localized supply chain imbalances and eliminates commercial food waste across restaurant branches by combining **atomic micro-ingredient recipe deductions**, a **10km geospatial geofencing engine**, **First Expiring, First Out (FEFO)** donor selection, and **bidirectional Socket.IO pings**.

---

## 📁 Project Structure

```text
backend_R/                     <-- Project Workspace Root
├── README.md                  <-- This User Guide
├── backend_R/                 <-- Backend Node.js / Express Server
│   ├── Config/
│   │   └── supabase.js        <-- Supabase database client
│   ├── controllers/           <-- Order, Transfer, Inventory, Store controllers
│   ├── routes/                <-- Express REST API endpoints
│   ├── utils/
│   │   └── geo.js             <-- 10km Haversine distance calculator
│   ├── seed.js                <-- Realistic data seeder script
│   ├── server.js              <-- Server entry point with Socket.IO
│   ├── package.json           <-- Backend dependencies
│   └── .env                   <-- Environment variables & Supabase credentials
└── frontend/                  <-- React + Vite Client Application
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx           <-- Navigation & store switcher
    │   │   ├── POSSimulator.jsx     <-- Live customer ordering & micro-deduction
    │   │   ├── ManagerDashboard.jsx <-- 10km Leaflet radar & ping action center
    │   │   ├── ESGAnalytics.jsx     <-- Food waste & financial metrics
    │   │   └── PingAlertModal.jsx   <-- Real-time slide-in emergency alert
    │   ├── services/
    │   │   ├── api.js         <-- REST API service
    │   │   └── socket.js      <-- Socket.IO client singleton
    │   ├── App.jsx            <-- Root application component
    │   ├── index.css          <-- Custom glassmorphism design system
    │   └── main.jsx           <-- React DOM entry point
    ├── vite.config.js         <-- Vite configuration with port 4000 proxy
    └── package.json           <-- Frontend dependencies
```

---

## ⚡ Prerequisites

Before running the application, make sure you have the following installed on your computer:

- **Node.js**: Version `18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: Comes bundled with Node.js
- **Modern Web Browser**: Google Chrome, Edge, Firefox, or Brave

---

## 🚀 Quick Start Guide (Run in 2 Steps)

To run the full stack, you will open **two terminal windows**: one for the backend and one for the frontend.

### Step 1: Start the Backend Server (Port 4000)

1. Open your terminal in the workspace root:
   ```powershell
   cd backend_R
   ```
2. *(First time only)* Install backend dependencies:
   ```powershell
   npm install
   ```
3. *(Optional)* If your database is ever empty, seed realistic restaurant data:
   ```powershell
   npm run seed
   ```
4. Start the backend with auto-reload:
   ```powershell
   npm run dev
   ```
   *You should see:*
   ```text
   🚀 Autonomous Kitchen Server running on port 4000
   📡 Socket.IO Real-time Engine initialized.
   ```

---

### Step 2: Start the React Frontend (Port 3000)

1. Open a **second terminal window** in the workspace root:
   ```powershell
   cd frontend
   ```
2. *(First time only)* Install frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   *You should see:*
   ```text
   VITE v8.x.x  ready in ... ms

   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

4. Open your browser and navigate to:
   👉 **`http://localhost:3000`**

---

## 🎮 How to Operate the Application

### 1. Global Navigation & Store Perspective
- Look at the top-right header: you will see a **Store Switcher Dropdown** (e.g., *Central Hub - Connaught Place*, *Express - Paharganj*, etc.).
- Changing the selected store switches your operational perspective in real time:
  - When you are at Store A, you can simulate customer orders there.
  - Switch to Store B to see incoming restock alerts requested by Store A!
- The **Live Socket.IO** badge confirms you are connected to the bidirectional WebSocket engine.

---

### 2. POS Terminal (Module 1)
- **Menu Selection**: Browse available dishes (Burgers, Fries, Beverages, Combos).
- **Bill of Materials (BOM)**: Each menu card displays the exact recipe requirements (e.g., *1 Burger requires 1 Bun + 1 Patty + 1 Cheese Slice + 50g Tomato*).
- **Micro-Deduction Engine (Right Panel)**:
  - As you add items to the cart, the system dynamically calculates the total raw ingredients that will be consumed.
  - It cross-references the store's current inventory.
  - If placing the order will cause an ingredient to drop below its safety reorder threshold, a **red warning banner** appears notifying you that an autonomous redistribution ping will be triggered!
- **Place Order**: Click **"Place Order & Deduct Inventory"**.
  - Confetti will appear upon success.
  - An atomic order receipt modal opens displaying the exact quantities deducted and confirming any 10km autonomous pings dispatched to nearby stores.

---

### 3. 10km Radar & Manager Dashboard (Module 2)
- Click the **"10km Radar & Manager"** tab in the navigation bar.
- **Interactive 10km Leaflet Map**:
  - The map is centered on your active store.
  - A cyan circle represents the **10km geofence radius boundary**. Only stores within this boundary can participate in micro-redistributions.
  - Markers represent partner restaurants.
  - Red dashed lines represent active transfer vectors between donor and recipient stores.
- **Micro-Inventory Gauges**:
  - Real-time stock progress bars for all 9 ingredients.
  - Color-coded badges: 🟢 **Optimal**, 🟡 **Reorder Zone**, 🔴 **Critical Shortage**.
  - **FEFO Days-to-Expiry Tracking**: Shows how many days remain before that batch expires.
- **Autonomous Redistribution Ping Center (Bottom)**:
  - **Incoming Fulfillment Requests**: Shows requests where *another* store is low on stock and your store was selected as the best donor (due to having surplus and stock expiring earliest).
  - Click **"Accept & Dispatch Stock"**: Atomically deducts stock from your store, credits the recipient store, updates the transfer to `COMPLETED`, and emits real-time updates.
- **Manual Scan**: Click **"Run Autonomous 10km Scan"** to perform an instant full-network check.

---

### 4. ESG & Franchise Analytics (Module 3)
- Click the **"ESG & Analytics"** tab in the navigation bar.
- **Executive KPI Cards**:
  - **Food Waste Prevented (kg)**: Total perishable food rescued before expiration.
  - **Supply Chain Cost Saved (₹)**: Monetary value of salvaged ingredients.
  - **Completed Transfers**: Total batches successfully rebalanced.
  - **Active Network Shortages**: Real-time count of ingredients needing restock.
- **Top Transferred Raw Materials Chart**: Recharts bar chart showing the ingredients most frequently balanced across stores.
- **Store Cluster Health Matrix**: Live health status for each store branch (*Optimal*, *Warning*, or *Critical*).
- **Audit Ledger**: Complete historical table of every transfer ping with timestamps, donor, recipient, ingredient, quantity, distance (km), and status.

---

## 🛠️ REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Expands menu items via recipe BOM, deducts inventory, checks reorder thresholds, and triggers 10km FEFO pings |
| `GET` | `/api/inventory` | Retrieves inventory for a store (`?store_id=UUID`) |
| `GET` | `/api/transfer` | Lists transfer pings with populated store & ingredient details |
| `POST` | `/api/transfer/scan` | Executes full-network autonomous 10km FEFO redistribution scan |
| `POST` | `/api/transfer/:id/accept` | Atomically transfers stock from donor to recipient and marks transfer completed |
| `POST` | `/api/transfer/:id/reject` | Rejects/declines a transfer ping |
| `GET` | `/api/analytics` | Aggregates ESG food waste prevented, cost savings, and store health metrics |
| `GET` | `/api/stores` | Lists all participating restaurant branches with coordinates |
| `GET` | `/api/menu` | Lists menu items and pricing |
| `GET` | `/api/recipes` | Retrieves Recipe Bill of Materials (BOM) mappings |

---

## ❓ Troubleshooting & FAQs

### Q: Port 4000 is already in use (`EADDRINUSE`)
- **Fix**: Another Node process is running on port 4000. Open PowerShell and run:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
  ```
  Then restart with `npm run dev`.

### Q: How do I test the autonomous ping alert?
1. Switch to **Central Hub - Connaught Place** in the header.
2. In the **POS Terminal**, order 2 &times; *Classic Crispy Veg Burger* or *Chef Special Combo Meal*.
3. The store's patties or potatoes will drop below reorder level.
4. The system will automatically compute distances, locate **Express - Paharganj** (1.4 km away, within 10km) as the FEFO donor, and create a transfer ping.
5. Switch the store dropdown to **Express - Paharganj**: you will see the incoming restock request with the **"Accept & Dispatch Stock"** button!

### Q: How do I reset or re-populate test data?
Inside `backend_R/backend_R`, run:
```powershell
npm run seed
```
This resets the stores, menu items, recipe BOMs, and inventory levels with realistic Delhi-NCR cluster data.

import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || undefined;

// Connect to backend (supports local proxy or deployed Render URL)
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling']
});

export const joinStoreRoom = (storeId) => {
  if (storeId) {
    socket.emit('join_store', storeId);
  }
};

export const leaveStoreRoom = (storeId) => {
  if (storeId) {
    socket.emit('leave_store', storeId);
  }
};

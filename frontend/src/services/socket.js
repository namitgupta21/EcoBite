import { io } from 'socket.io-client';

// Connect to current origin, which is proxied to backend port 4000
export const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
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

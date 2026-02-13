import { io as ioClient } from 'socket.io-client';
import { getToken } from '../utils/auth';

let socket = null;

export const connectSocket = (opts = {}) => {
  if (socket) return socket;
  const token = getToken();
  const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000';

  socket = ioClient(url, {
    auth: { token },
    ...opts
  });

  socket.on('connect', () => {
    console.info('Socket connected', socket.id);
  });

  socket.on('disconnect', () => {
    console.info('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };

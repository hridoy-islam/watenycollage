import { io } from 'socket.io-client';
import { refreshToken } from './axios';
import store from '../redux/store';

// The socket server sits on the API host, without the `/api` path.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  String(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

const readToken = (): string | null => {
  try {
    return JSON.parse(localStorage.getItem('watney') || 'null');
  } catch {
    return null;
  }
};

// The server reads who this socket belongs to from the access token, so the
// token is sent on every (re)connect - and nothing connects until there is a
// signed-in user to send one for.
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => cb({ token: readToken() })
});

let connectedAs: string | null = null;
let refreshing = false;

// A rejected handshake is not retried by socket.io, so an expired token is
// refreshed and the connection tried again.
socket.on('connect_error', async (error) => {
  if (error?.message !== 'JWT Expired' || refreshing || !connectedAs) return;
  refreshing = true;
  const token = await refreshToken();
  refreshing = false;
  if (token && connectedAs) socket.connect();
});

export const setupSocket = (userId) => {
  if (!userId) return;
  const id = String(userId);

  // Someone else signed in on this tab: the old connection is in the old
  // user's room, so it is replaced rather than reused.
  if (connectedAs && connectedAs !== id) socket.disconnect();
  connectedAs = id;

  if (!socket.connected && !socket.active) socket.connect();
};

export const disconnectSocket = () => {
  connectedAs = null;
  socket.disconnect();
};

// However the user is signed out - the logout button or a failed refresh -
// the connection in their room goes with them.
store.subscribe(() => {
  if (connectedAs && !(store.getState() as any)?.auth?.user) disconnectSocket();
});

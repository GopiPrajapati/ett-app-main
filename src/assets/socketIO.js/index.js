import {APP_CONFIG, DEVELOPMENT_SOCKET_URL, PRODUCTION_SOCKET_URL} from '@env';
import {io} from 'socket.io-client';
import {checkInternetConnection} from '../../commonutils/helper';

let socket;

const SOCKET_EVENTS = {
  CONNECT: 'connect', // Event Desc: Initial Connection
  DISCONNECT: 'disconnect', // Event Desc: Manual/Auto Disconnection
  RECONNECT: 'reconnect', // Event Desc: Manual/Auto Re-connection
  ERROR: 'error',
  SEND_MESSAGE: 'sendMessage',
  MESSAGE: 'sendMessage',
  CHECK_NOTIFICATIONS: 'subscribeToNotifications',
  UNREAD_NOTIFICATION_COUNT: 'unreadNotificationCount',
};

export async function initSocket(token) {
  if (!token) {
    return;
  }

  if (socket) {
    if (socket.connected) {
      console.log('✅ Socket is already connected');
      return socket;
    } else if (socket.connecting || socket.reconnecting) {
      console.log('⏳ Socket is currently connecting or reconnecting');
      return new Promise(resolve => {
        socket.on(SOCKET_EVENTS.CONNECT, () => {
          console.log('🔗 Socket connected');
          resolve(socket);
        });
        socket.on(SOCKET_EVENTS.RECONNECT, () => {
          console.log('🔄 Socket reconnected');
          resolve(socket);
        });
      });
    }
  }

  let socketUrl = `${
    APP_CONFIG === 'DEVELOPMENT'
      ? DEVELOPMENT_SOCKET_URL
      : PRODUCTION_SOCKET_URL
  }?EIO=4`;
  console.log(`🌐 Connecting to socket at ${socketUrl}`);
  // console.log(`🔑 Token: ${token}`);
  socket = io(socketUrl, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    auth: {
      token: `Bearer ${token} `,
    },
  });

  return new Promise(resolve => {
    socket.open();
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('✅ Socket successfully connected');
      resolve(socket);
    });
    socket.on(SOCKET_EVENTS.RECONNECT, () => {
      console.log('🔄 Socket successfully reconnected');
      resolve(socket);
    });
    socket.on(SOCKET_EVENTS.ERROR, error => {
      console.error('❌ Socket error:', error);
      resolve(false);
    });
  });
}

export function reconnect() {
  console.log('🔄 Attempting to reconnect...');
  socket.on(SOCKET_EVENTS.RECONNECT, () => {
    console.log('✅ Successfully reconnected');
  });
}

export function disconnect() {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
  }
}

export function registerError(onMessageRead) {
  console.log('⚠️ Registering error listener');
  socket.off(SOCKET_EVENTS.ERROR).on(SOCKET_EVENTS.ERROR, onMessageRead);
}

export async function emitMessageSend(message) {
  try {
    console.log('📤 Sending message:', message);
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      throw new Error('🚫 No internet connection available.');
    }

    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, message);
    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    throw error;
  }
}

export function getMessage(onMessage) {
  console.log('📩 Listening for incoming messages');
  socket.off(SOCKET_EVENTS.MESSAGE).on(SOCKET_EVENTS.MESSAGE, onMessage);
}

export function checkNotifications() {
  console.log('🔔 Checking notifications');
  socket.emit(SOCKET_EVENTS.CHECK_NOTIFICATIONS);
}

export function getUnreadNotificationCount(getNotificationEvent) {
  console.log('📥 Listening for unread notification count');
  socket
    .off(SOCKET_EVENTS.UNREAD_NOTIFICATION_COUNT)
    .on(SOCKET_EVENTS.UNREAD_NOTIFICATION_COUNT, getNotificationEvent);
}

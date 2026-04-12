import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
      // Join district room for local notifications
      if (user.district) socket.emit('join-location', user.district);
    });

    // New listing in your area
    socket.on('new-listing', (data) => {
      const notif = {
        id: Date.now(),
        type: 'new_listing',
        message: data.message,
        listing: data.listing,
        time: new Date(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
      toast(`🌱 ${data.message}`, { icon: '📍' });
    });

    // Platform-wide new listing
    socket.on('listing-created', (listing) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'listing_created',
        message: `New ${listing.cropName} listed at ₹${listing.price}/kg`,
        listing,
        time: new Date(),
        read: false,
      }, ...prev.slice(0, 49)]);
    });

    socket.on('disconnect', () => console.log('❌ Socket disconnected'));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unreadCount, markAllRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

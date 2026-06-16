import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, api } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch initial persistent notifications from database
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const { data } = await api.get('/users/notifications');
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications', error);
        }
      };
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Handle socket connection
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join', user._id);
    });

    newSocket.on('notification', (data) => {
      // Add to screen toasts
      addToast(data.title, data.message, data.type);
      // Prepend to persistent notifications list
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: false,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/users/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, toasts, notifications, addToast, markAsRead }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-2xl border flex flex-col gap-1 backdrop-blur-md relative overflow-hidden ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/50'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/90 text-amber-100 border-amber-500/50'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 text-rose-100 border-rose-500/50'
                  : 'bg-slate-900/95 text-slate-100 border-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm tracking-wide">{toast.title}</h4>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity ml-2"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
              
              {/* Progress bar animation */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${
                  toast.type === 'success'
                    ? 'bg-emerald-400'
                    : toast.type === 'warning'
                    ? 'bg-amber-400'
                    : toast.type === 'error'
                    ? 'bg-rose-400'
                    : 'bg-blue-400'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SocketContext.Provider>
  );
};

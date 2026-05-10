import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'error': return <XCircle size={18} className="text-red-500" />;
      case 'warning': return <AlertCircle size={18} className="text-amber-500" />;
      case 'info': return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[400px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="bg-white luxury-shadow p-4 border border-stone-100 flex items-start gap-4 relative group">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                    {n.type}
                  </p>
                  <p className="text-xs font-bold text-primary leading-relaxed">
                    {n.message}
                  </p>
                </div>
                <button 
                  onClick={() => removeNotification(n.id)}
                  className="text-stone-300 hover:text-primary transition-colors p-1"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-0 left-0 h-1 bg-gold/10 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className={cn(
                      "h-full",
                      n.type === 'success' ? "bg-emerald-500" : 
                      n.type === 'error' ? "bg-red-500" : 
                      n.type === 'warning' ? "bg-amber-500" : "bg-blue-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

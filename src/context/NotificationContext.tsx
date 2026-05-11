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

  const getTheme = (type: NotificationType) => {
    switch (type) {
      case 'success': return { icon: <CheckCircle2 size={18} />, color: 'emerald', bg: 'bg-emerald-500' };
      case 'error': return { icon: <XCircle size={18} />, color: 'red', bg: 'bg-red-500' };
      case 'warning': return { icon: <AlertCircle size={18} />, color: 'amber', bg: 'bg-amber-500' };
      case 'info': return { icon: <Info size={18} />, color: 'blue', bg: 'bg-blue-500' };
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-4 w-full max-w-[380px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => {
            const theme = getTheme(n.type);
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8
                }}
                className="pointer-events-auto"
              >
                <div className="bg-white/95 backdrop-blur-xl luxury-shadow-lg overflow-hidden border border-stone-100 group">
                  <div className="p-5 flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                      n.type === 'success' ? "bg-emerald-50 text-emerald-500" :
                      n.type === 'error' ? "bg-red-50 text-red-500" :
                      n.type === 'warning' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                    )}>
                      {theme.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-[0.3em]",
                          n.type === 'success' ? "text-emerald-600" :
                          n.type === 'error' ? "text-red-600" :
                          n.type === 'warning' ? "text-amber-600" : "text-blue-600"
                        )}>
                          {n.type}
                        </p>
                        <button 
                          onClick={() => removeNotification(n.id)}
                          className="text-stone-300 hover:text-primary transition-all p-1 -mr-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-primary leading-relaxed tracking-tight">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <div className="h-1 bg-stone-50 w-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      className={cn("absolute inset-0 h-full", theme.bg)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

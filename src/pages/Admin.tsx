import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import logo from '../assets/logo.png';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  Users, 
  Layers, 
  ChevronRight, 
  LogOut,
  XCircle,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import AdminDashboard from '../components/AdminDashboard';
import AdminProducts from '../components/AdminProducts';
import AdminOrders from '../components/AdminOrders';
import AdminSettings from '../components/AdminSettings';
import AdminCategories from '../components/AdminCategories';
import AdminCustomers from '../components/AdminCustomers';

type ActiveModule = 'overview' | 'orders' | 'products' | 'categories' | 'customers' | 'settings';

const MENU_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: true },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Admin authorization
  const isAdmin = user?.email === 'gfcollection@gmail.com'; 

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for Admin Notifications (Orders & Stock)
  useEffect(() => {
    if (!isAdmin) return;

    // 1. Listen for New Orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'order',
        title: 'New Order Placed',
        description: `Order ${doc.data().orderId} from ${doc.data().fullName}`,
        time: doc.data().createdAt?.toDate() || new Date(),
        read: false
      }));
      setNotifications(prev => {
        const otherNotifs = prev.filter(n => n.type !== 'order');
        return [...newOrders, ...otherNotifs].sort((a, b) => b.time - a.time);
      });
    });

    // 2. Listen for Low Stock
    const productsQuery = query(collection(db, 'products'), where('stockQuantity', '<', 5));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const lowStockNotifs = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'stock',
        title: 'Low Stock Alert',
        description: `${doc.data().name} has only ${doc.data().stockQuantity} units left`,
        time: new Date(),
        read: false
      }));
      setNotifications(prev => {
        const otherNotifs = prev.filter(n => n.type !== 'stock');
        return [...lowStockNotifs, ...otherNotifs].sort((a, b) => b.time - a.time);
      });
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, [isAdmin]);

  // Layout and Navigation

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-white luxury-shadow max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-3xl font-display text-primary mb-4">Access Denied</h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            You don't have permission to access the Admin Panel. Please sign in with an administrator account.
          </p>
          <button 
            onClick={logout}
            className="w-full bg-primary text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-gold transition-all luxury-shadow"
          >
            Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return <AdminDashboard />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'categories': return <AdminCategories />;
      case 'customers': return <AdminCustomers />;
      case 'settings': return <AdminSettings />;
      default: return (
        <div className="bg-white p-20 text-center luxury-shadow">
          <Layers className="mx-auto text-stone-100 mb-6" size={80} />
          <h3 className="font-display text-2xl text-stone-300">Feature Coming Soon</h3>
          <p className="text-[10px] uppercase tracking-widest font-black text-stone-300 mt-2">Currently being developed</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex overflow-x-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-stone-100 flex flex-col transition-all duration-500 z-[100] fixed lg:static inset-y-0 left-0",
          isSidebarOpen ? "w-72" : "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-24 flex items-center justify-between px-8 border-b border-stone-50 overflow-hidden">
          <div className="flex items-center gap-3">
             <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
             <div className={cn("transition-opacity duration-300 whitespace-nowrap", !isSidebarOpen && "lg:opacity-0")}>
               <h1 className="font-display text-xl text-primary">Admin Panel</h1>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold">GF Collection</p>
             </div>
          </div>
          {/* Mobile Close */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-stone-400 hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveModule(item.id as ActiveModule);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden",
                activeModule === item.id 
                  ? "bg-primary text-white luxury-shadow font-bold" 
                  : "text-stone-400 hover:bg-stone-50"
              )}
            >
              <div className="flex-shrink-0">
                <item.icon size={20} />
              </div>
              <span className={cn(
                "text-xs uppercase tracking-widest font-bold whitespace-nowrap transition-opacity",
                !isSidebarOpen && "lg:opacity-0"
              )}>
                {item.label}
              </span>
              {activeModule === item.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute right-0 w-1 h-6 bg-gold rounded-l-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-50">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 text-stone-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className={cn(
              "text-xs uppercase tracking-widest font-bold transition-opacity",
              !isSidebarOpen && "lg:opacity-0"
            )}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-stone-50 rounded-lg text-primary transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-8 w-px bg-stone-100 hidden sm:block" />
            <div className="hidden lg:block">
              <h2 className="text-[8px] uppercase tracking-[0.3em] font-black text-stone-300">System</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={cn(
                  "p-2 rounded-xl transition-all relative",
                  isNotificationsOpen ? "bg-stone-50 text-gold" : "text-stone-300 hover:text-primary"
                )}
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-white luxury-shadow-lg border border-stone-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-stone-50 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Notification Center</h3>
                        <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 font-bold uppercase tracking-widest">{notifications.length} Alerts</span>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n.id} className="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors group cursor-pointer">
                              <div className="flex gap-4">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                  n.type === 'order' ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                                )}>
                                  {n.type === 'order' ? <ShoppingBag size={14} /> : <Package size={14} />}
                                </div>
                                <div className="flex-1 space-y-0.5">
                                  <p className="text-[10px] font-bold text-primary group-hover:text-gold transition-colors">{n.title}</p>
                                  <p className="text-[9px] text-stone-400 line-clamp-2">{n.description}</p>
                                  <p className="text-[7px] text-stone-300 font-bold uppercase tracking-widest pt-1">
                                    {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center">
                            <Bell className="mx-auto text-stone-100 mb-4" size={32} />
                            <p className="text-[8px] uppercase tracking-widest font-black text-stone-300">All systems clear</p>
                          </div>
                        )}
                      </div>
                      
                      <button className="w-full py-3 bg-stone-50 text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-primary hover:bg-stone-100 transition-all border-t border-stone-100">
                        View All Activity
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-stone-100" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-tight">{user?.displayName || 'Admin'}</p>
                <p className="text-[8px] text-stone-400 font-medium uppercase tracking-tighter">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                <img src={`https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=c5a059&color=fff`} alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="p-4 sm:p-8 lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/10 backdrop-blur-[2px] z-[90] lg:hidden"
        />
      )}
    </div>
  );
}


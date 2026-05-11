import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Admin authorization
  const isAdmin = user?.email === 'gfcollection@gmail.com'; 

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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-stone-100 flex flex-col transition-all duration-500 z-[100] fixed lg:static inset-y-0 left-0",
          isSidebarOpen ? "w-72" : "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-24 flex items-center px-8 border-b border-stone-50 overflow-hidden">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">G</div>
             <div className={cn("transition-opacity duration-300 whitespace-nowrap", !isSidebarOpen && "lg:opacity-0")}>
               <h1 className="font-display text-xl text-primary">Admin Panel</h1>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold">GF Collection</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as ActiveModule)}
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
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-stone-50 rounded-lg text-primary transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-8 w-px bg-stone-100 hidden sm:block" />
            <div className="hidden sm:block">
              <h2 className="text-xs uppercase tracking-[0.3em] font-black text-stone-300">Status </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">System Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-stone-300" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold border-2 border-white rounded-full" />
            </div>
            <div className="h-8 w-px bg-stone-100" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">{user?.displayName || 'Admin'}</p>
                <p className="text-[10px] text-stone-400 font-medium">Administrator</p>
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


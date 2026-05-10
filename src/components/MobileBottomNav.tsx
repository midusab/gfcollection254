import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Search, ShoppingCart, User, X, ChevronRight, Sparkles, Footprints, ShoppingBag, Layers, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useCartStore } from '../store';

export default function MobileBottomNav() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Categories', icon: Grid, onClick: () => setIsCategoriesOpen(true) },
    { label: 'Search', icon: Search, path: '/shop' },
    { label: 'Cart', icon: ShoppingCart, path: '/cart', badge: cartCount },
    { label: 'Account', icon: User, path: '/profile' },
  ];

  const categories = [
    { name: 'Dresses', path: '/shop?category=Dresses', color: 'bg-stone-50', icon: Sparkles },
    { name: 'Shoes', path: '/shop?category=Shoes', color: 'bg-stone-50', icon: Footprints },
    { name: 'Bags', path: '/shop?category=Bags', color: 'bg-stone-50', icon: ShoppingBag },
    { name: 'Collections', path: '/shop', color: 'bg-stone-50', icon: Layers },
    { name: 'Sale', path: '/shop?sale=true', color: 'bg-blue-50 text-blue-600', icon: Percent },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-2 z-[60] safe-bottom">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return item.path ? (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all",
                  isActive ? "text-gold" : "text-gray-400"
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center luxury-shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all",
                  isCategoriesOpen ? "text-gold" : "text-gray-400"
                )}
              >
                <Icon size={20} strokeWidth={isCategoriesOpen ? 2 : 1.5} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Categories Overlay */}
      <AnimatePresence>
        {isCategoriesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-primary/40 backdrop-blur-sm z-[70] flex items-end justify-center px-4 pb-24"
            onClick={() => setIsCategoriesOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 luxury-shadow flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-display text-primary">Categories</h3>
                <button 
                  onClick={() => setIsCategoriesOpen(false)}
                  className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="grid gap-3">
                {categories.map((cat, idx) => (
                  <motion.div
                    key={cat.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={cat.path}
                      onClick={() => setIsCategoriesOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95 group",
                        cat.color
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <cat.icon size={16} className={cn(cat.name === 'Sale' ? "text-[#1E90FF]" : "text-gold")} />
                        </div>
                        <span className={cn(
                          "text-xs uppercase tracking-widest font-bold",
                          cat.name === 'Sale' ? "text-[#1E90FF]" : "text-primary"
                        )}>
                          {cat.name}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gold transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium pt-2">
                Elevating Kenyan Fashion
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

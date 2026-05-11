import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Phone, Heart, LogOut, Loader2 } from 'lucide-react';
import { useCartStore } from '../store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithGoogle, logout, signInLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'New In', path: '/shop?new=true' },
    { 
      name: 'Dresses', 
      path: '/shop?category=Dresses',
      dropdown: [
        { name: 'Office Dresses', path: '/shop?category=Clothing&subcategory=Office Dresses' },
        { name: 'Dinner Dresses', path: '/shop?category=Clothing&subcategory=Dinner Dresses' },
        { name: 'Event Dresses', path: '/shop?category=Clothing&subcategory=Event Dresses' },
        { name: 'Maxi Dresses', path: '/shop?category=Clothing&subcategory=Maxi Dresses' },
        { name: 'Bodycon Dresses', path: '/shop?category=Clothing&subcategory=Bodycon Dresses' },
        { name: 'Casual Dresses', path: '/shop?category=Clothing&subcategory=Casual Dresses' },
        { name: 'Birthday Dresses', path: '/shop?category=Clothing&subcategory=Birthday Dresses' },
        { name: 'New Arrivals', path: '/shop?new=true' },
      ]
    },
    { 
      name: 'Shoes', 
      path: '/shop?category=Shoes',
      dropdown: [
        { name: 'Heels', path: '/shop?category=Shoes&subcategory=Heels' },
        { name: 'Official Shoes', path: '/shop?category=Shoes&subcategory=Official Shoes' },
        { name: 'Sneakers', path: '/shop?category=Shoes&subcategory=Sneakers' },
        { name: 'Sandals', path: '/shop?category=Shoes&subcategory=Sandals' },
        { name: 'Boots', path: '/shop?category=Shoes&subcategory=Boots' },
        { name: 'Luxury Heels', path: '/shop?category=Shoes&subcategory=Luxury Heels' },
        { name: 'Trending Shoes', path: '/shop?sort=trending' },
      ]
    },
    { 
      name: 'Bags', 
      path: '/shop?category=Bags',
      dropdown: [
        { name: 'Handbags', path: '/shop?category=Bags&subcategory=Handbags' },
        { name: 'Office Bags', path: '/shop?category=Bags&subcategory=Office Bags' },
        { name: 'Mini Bags', path: '/shop?category=Bags&subcategory=Mini Bags' },
        { name: 'Luxury Bags', path: '/shop?category=Bags&subcategory=Luxury Bags' },
        { name: 'Crossbody Bags', path: '/shop?category=Bags&subcategory=Crossbody Bags' },
        { name: 'Party Bags', path: '/shop?category=Bags&subcategory=Party Bags' },
        { name: 'Travel Bags', path: '/shop?category=Bags&subcategory=Travel Bags' },
      ]
    },
    { 
      name: 'Collections', 
      path: '/shop',
      dropdown: [
        { name: 'Boss Lady Collection', path: '/shop?collection=BossLady' },
        { name: 'Date Night Collection', path: '/shop?collection=DateNight' },
        { name: 'Wedding Guest Looks', path: '/shop?collection=WeddingGuest' },
        { name: 'Campus Fashion', path: '/shop?collection=Campus' },
        { name: 'Soft Girl Collection', path: '/shop?collection=SoftGirl' },
        { name: 'Luxury Queen Collection', path: '/shop?collection=LuxuryQueen' },
        { name: 'Weekend Fits', path: '/shop?collection=Weekend' },
      ]
    },
    { name: 'Best Sellers', path: '/shop?sort=best' },
    { name: 'Sale', path: '/shop?sale=true' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 py-4 px-4 sm:px-8",
        isScrolled || !isHome ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-8">
        {/* Logo Left */}
        <Link to="/" className="flex-shrink-0 flex flex-col group">
          <span className={cn(
            "text-2xl md:text-3xl font-display font-medium tracking-[0.2em] transition-colors uppercase",
            isScrolled || !isHome ? "text-primary" : "text-white"
          )}>
            GF
          </span>
          <span className={cn(
            "text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-bold transition-colors",
            isScrolled || !isHome ? "text-gold" : "text-white/80"
          )}>
            The Power House of Fashion
          </span>
        </Link>

        {/* Desktop Links - Now Centered or Just Left-Center */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group/nav">
              <Link 
                to={link.path}
                className={cn(
                  "text-xs uppercase tracking-widest font-semibold transition-all relative block py-2",
                  link.name === 'Sale' 
                    ? "text-[#1E90FF] font-bold" 
                    : (isScrolled || !isHome ? "text-primary" : "text-white"),
                  "hover:text-gold"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-[1px] transition-all group-hover/nav:w-full",
                  link.name === 'Sale' ? "bg-[#1E90FF]" : "bg-gold"
                )} />
              </Link>

              {/* Mega Dropdown */}
              {link.dropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 hidden group-hover/nav:block w-64 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-white luxury-shadow p-6 border border-beige">
                    <ul className="space-y-4">
                      {link.dropdown.map((item) => (
                        <li key={item.name}>
                          <Link 
                            to={item.path}
                            className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-gold transition-colors block"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions Icons - Right Aligned */}
        <div className="flex items-center gap-1 sm:gap-4 relative">
          <form 
            onSubmit={handleSearch}
            className={cn(
              "flex items-center transition-all duration-500 ease-in-out border-b overflow-hidden",
              isSearchExpanded ? "w-40 sm:w-64 border-gold opacity-100 px-2" : "w-0 border-transparent opacity-0"
            )}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search elegance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setIsSearchExpanded(false)}
              className={cn(
                "w-full bg-transparent border-none outline-none text-xs uppercase tracking-widest font-semibold py-2",
                isScrolled || !isHome ? "text-primary placeholder:text-gray-400" : "text-white placeholder:text-white/50"
              )}
            />
          </form>

          <button 
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className={cn(
              "p-2 hover:text-gold transition-colors relative z-10",
              isScrolled || !isHome ? "text-primary" : "text-white"
            )}
          >
            {isSearchExpanded && searchQuery ? (
              <X 
                size={20} 
                strokeWidth={1.5} 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }} 
              />
            ) : (
              <Search size={20} strokeWidth={1.5} />
            )}
          </button>
          
          <Link to="/profile" className={cn(
            "p-2 hover:text-gold transition-colors hidden sm:block",
            isScrolled || !isHome ? "text-primary" : "text-white"
          )}>
            <Heart size={20} strokeWidth={1.5} />
          </Link>
          
          <Link to="/cart" className={cn(
            "relative p-2 hover:text-gold transition-colors",
            isScrolled || !isHome ? "text-primary" : "text-white"
          )}>
            <ShoppingCart size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-gold text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center luxury-shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Action */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  "p-2 hover:text-gold transition-colors flex items-center gap-2",
                  isScrolled || !isHome ? "text-primary" : "text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=00234b&color=fff`} 
                    alt={user.displayName || 'User'} 
                    className="w-6 h-6 rounded-full border border-gold/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden md:block text-[10px] uppercase tracking-widest font-bold">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </div>
              </button>
            ) : (
              <Link 
                to="/auth"
                className={cn(
                  "p-2 hover:text-gold transition-colors flex items-center gap-2",
                  isScrolled || !isHome ? "text-primary" : "text-white"
                )}
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}

            {/* User Dropdown */}
            <AnimatePresence>
              {user && showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-beige shadow-xl z-50 p-4"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 px-2">
                    Account
                  </p>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 text-xs font-bold text-primary hover:text-gold p-2 transition-colors uppercase tracking-widest"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={14} /> My Profile
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 text-xs font-bold text-red-500 hover:text-red-600 p-2 transition-colors uppercase tracking-widest mt-2 border-t border-beige pt-4"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hide mobile menu toggle as we have bottom nav now */}
          <div className="lg:hidden" />
        </div>
      </div>
    </nav>
  );
}

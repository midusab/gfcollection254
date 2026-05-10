import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Heart, ShoppingBag, Settings, LogOut, Loader2, Camera } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { products } from '../mockData';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist' | 'orders'>('overview');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const wishlistRef = collection(db, 'wishlists', user.uid, 'items');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      setWishlistCount(snapshot.size);
      const items = snapshot.docs.map(doc => {
        const item = doc.data();
        return products.find(p => p.id === item.productId);
      }).filter(Boolean);
      setWishlistItems(items);
    });

    return unsubscribe;
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <Loader2 className="animate-spin text-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white luxury-shadow p-8 border border-stone-200 text-center">
              <div className="relative inline-block mb-6">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=00234b&color=fff&size=200`} 
                  alt={user.displayName || 'User'} 
                  className="w-32 h-32 rounded-full border-2 border-gold/20 object-cover mx-auto"
                />
                <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-stone-100 hover:text-gold transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-display font-medium text-primary mb-1">
                {user.displayName || user.email?.split('@')[0]}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-6">
                Gold Member
              </p>
              
              <div className="space-y-2 pt-6 border-t border-beige">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-beige text-gray-400'}`}
                >
                  <User size={14} /> Account Overview
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'hover:bg-beige text-gray-400'}`}
                >
                  <Heart size={14} /> My Wishlist ({wishlistCount})
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-beige text-gray-400'}`}
                >
                  <ShoppingBag size={14} /> Order History
                </button>
                {user.email === 'gfcollection@gmail.com' && (
                  <Link 
                    to="/admin"
                    className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gold hover:bg-beige transition-all border-t border-beige mt-2 pt-2"
                  >
                    <Settings size={14} /> Admin Dashboard
                  </Link>
                )}
                <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:bg-beige transition-all">
                  <Settings size={14} /> Settings
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:bg-red-50 transition-all mt-4 border-t border-beige pt-6"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white luxury-shadow p-8 md:p-12 border border-stone-200 min-h-[600px]">
              {activeTab === 'overview' && (
                <div className="space-y-12">
                  <div>
                    <h3 className="text-2xl font-display text-primary mb-6">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Full Name</label>
                        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-100">
                          <User size={16} className="text-stone-400" />
                          <span className="text-sm font-medium">{user.displayName || 'Not Set'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email Address</label>
                        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-100">
                          <Mail size={16} className="text-stone-400" />
                          <span className="text-sm font-medium">{user.email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Account Created</label>
                        <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-100">
                          <Calendar size={16} className="text-stone-400" />
                          <span className="text-sm font-medium">Recently Joined</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border border-beige bg-stone-50/50 text-center space-y-2">
                      <div className="text-2xl font-display text-primary">{wishlistCount}</div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Wishlist Items</div>
                    </div>
                    <div className="p-6 border border-beige bg-stone-50/50 text-center space-y-2">
                      <div className="text-2xl font-display text-primary">0</div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Orders Placed</div>
                    </div>
                    <div className="p-6 border border-beige bg-stone-50/50 text-center space-y-2">
                      <div className="text-2xl font-display text-gold">VIP</div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Loyalty Status</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-2xl font-display text-primary mb-8">Your Wishlist</h3>
                  {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          className="group bg-white"
                        >
                          <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <div className="py-4 space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{product.category}</p>
                            <h4 className="text-sm font-medium text-primary line-clamp-1">{product.name}</h4>
                            <p className="text-xs font-bold text-gold">KES {product.price.toLocaleString()}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-beige">
                      <Heart className="mx-auto text-stone-200 mb-4" size={48} />
                      <p className="text-sm text-gray-500 font-light mb-8">Your wishlist is currently empty.</p>
                      <Link 
                        to="/shop" 
                        className="inline-block bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-gold transition-colors"
                      >
                        Explore Collections
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="text-center py-20">
                  <ShoppingBag className="mx-auto text-stone-200 mb-4" size={48} />
                  <p className="text-sm text-gray-500 font-light mb-4">You haven't placed any orders yet.</p>
                  <p className="text-[10px] uppercase tracking-widest text-gold font-bold">Start your luxury journey today</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

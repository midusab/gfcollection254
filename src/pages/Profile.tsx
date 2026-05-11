import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Heart, ShoppingBag, Settings, LogOut, Loader2, Camera, CreditCard } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { products } from '../mockData';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist' | 'orders'>('overview');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const wishlistRef = collection(db, 'wishlists', user.uid, 'items');
    const wishlistUnsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      setWishlistCount(snapshot.size);
      const items = snapshot.docs.map(doc => {
        const item = doc.data();
        return products.find(p => p.id === item.productId);
      }).filter(Boolean);
      setWishlistItems(items);
    });

    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('userId', '==', user.uid));
    const ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setOrders(ordersData);
      setOrdersLoading(false);
    });

    return () => {
      wishlistUnsubscribe();
      ordersUnsubscribe();
    };
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
                      <div className="text-2xl font-display text-primary">{orders.length}</div>
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
                <div className="space-y-8">
                  <h3 className="text-2xl font-display text-primary mb-8">Order History</h3>
                  
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="animate-spin text-gold" size={32} />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-stone-50/50 border border-beige p-6 sm:p-8 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-beige pb-6">
                            <div>
                              <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{order.orderId}</p>
                              <p className="text-[8px] text-gray-400 uppercase tracking-widest">
                                Placed on {order.createdAt?.toDate().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right">
                                  <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                  <p className="text-sm font-bold text-primary">KES {order.total.toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className={cn(
                                    "px-4 py-1.5 rounded-none text-[8px] font-black uppercase tracking-widest border shadow-sm",
                                    order.status === 'Delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    order.status === 'Cancelled' ? "bg-red-50 text-red-600 border-red-100" :
                                    order.status === 'Paid' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                                  )}>
                                    {order.mpesaCode && order.status === 'Pending Confirmation' ? 'Verifying Payment' : order.status}
                                  </span>
                                  {order.mpesaCode && (
                                    <p className="text-[7px] text-emerald-500 font-bold uppercase tracking-widest">Ref: {order.mpesaCode}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Package Items</p>
                              <div className="flex flex-wrap gap-4">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="group relative w-16 h-20 bg-white border border-beige p-1">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                                      <p className="text-[6px] text-white font-bold leading-tight">{item.name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Tracking</p>
                              <div className="relative pt-2">
                                <div className="absolute top-4 left-0 w-full h-0.5 bg-beige" />
                                <div 
                                  className="absolute top-4 left-0 h-0.5 bg-gold transition-all duration-1000" 
                                  style={{ 
                                    width: 
                                      order.status === 'Pending Confirmation' ? '10%' :
                                      order.status === 'Paid' ? '30%' :
                                      order.status === 'Processing' ? '60%' :
                                      order.status === 'Out for Delivery' ? '85%' :
                                      order.status === 'Delivered' ? '100%' : '0%'
                                  }} 
                                />
                                <div className="flex justify-between relative">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={cn("w-4 h-4 rounded-full border-2 bg-white z-10", order.createdAt ? "border-gold" : "border-beige")} />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-stone-400">Placed</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={cn("w-4 h-4 rounded-full border-2 bg-white z-10", ['Paid', 'Processing', 'Out for Delivery', 'Delivered'].includes(order.status) ? "border-gold" : "border-beige")} />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-stone-400">Paid</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={cn("w-4 h-4 rounded-full border-2 bg-white z-10", ['Processing', 'Out for Delivery', 'Delivered'].includes(order.status) ? "border-gold" : "border-beige")} />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-stone-400">Shipped</span>
                                  </div>
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={cn("w-4 h-4 rounded-full border-2 bg-white z-10", order.status === 'Delivered' ? "border-emerald-500 bg-emerald-500" : "border-beige")} />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-stone-400">Ready</span>
                                  </div>
                                </div>
                              </div>

                              {/* M-Pesa Verification Section */}
                              {order.status === 'Pending Confirmation' && !order.mpesaCode && (
                                <div className="mt-8 p-6 bg-emerald-50/50 border border-emerald-100 space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                      <CreditCard size={16} />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Payment Required</p>
                                      <p className="text-[8px] text-emerald-600 uppercase tracking-widest">Submit M-Pesa code to verify</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      placeholder="ENTER MPESA CODE (e.g. SAK9...)"
                                      id={`mpesa-input-${order.id}`}
                                      className="flex-1 px-4 py-2 bg-white border border-emerald-200 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500"
                                    />
                                    <button 
                                      onClick={async () => {
                                        const input = document.getElementById(`mpesa-input-${order.id}`) as HTMLInputElement;
                                        const code = input.value.toUpperCase().trim();
                                        if (code.length < 8) return alert('Please enter a valid M-Pesa transaction code');
                                        
                                        try {
                                          const orderRef = doc(db, 'orders', order.id);
                                          await updateDoc(orderRef, {
                                            mpesaCode: code,
                                            updatedAt: serverTimestamp()
                                          });
                                          alert('Code submitted! Our team will verify it shortly.');
                                        } catch (error) {
                                          console.error('Submission failed:', error);
                                        }
                                      }}
                                      className="bg-emerald-500 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                  <p className="text-[7px] text-emerald-600 leading-relaxed font-bold uppercase tracking-tighter">
                                    * Payments are processed manually via Pochi la Biashara. Please allow 5-15 mins for verification.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-beige">
                      <ShoppingBag className="mx-auto text-stone-200 mb-4" size={48} />
                      <p className="text-sm text-gray-500 font-light mb-8">You haven't placed any orders yet.</p>
                      <Link 
                        to="/shop" 
                        className="inline-block bg-primary text-white text-[10px] uppercase tracking-[0.2em] font-bold px-8 py-4 hover:bg-gold transition-colors"
                      >
                        Start Your Journey
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

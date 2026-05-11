import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShoppingBag, Truck, Package, CheckCircle2, Clock, XCircle, Search, Filter, MessageCircle, ExternalLink, Calendar, CreditCard, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_COLORS = {
  'Pending Confirmation': 'bg-amber-100 text-amber-700 border-amber-200',
  'Payment Sent': 'bg-blue-100 text-blue-700 border-blue-200',
  'Paid': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Processing': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Out for Delivery': 'bg-purple-100 text-purple-700 border-purple-200',
  'Delivered': 'bg-gray-100 text-gray-700 border-gray-200',
  'Cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS = {
  'Pending Confirmation': Clock,
  'Payment Sent': CreditCard,
  'Paid': CheckCircle2,
  'Processing': Package,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle2,
  'Cancelled': XCircle,
};

export default function AdminOrders() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      showNotification('Failed to load orders', 'error');
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      showNotification(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update status:', error);
      showNotification('Failed to update order status', 'error');
    }
  };

  const updateMpesaCode = async (orderId: string, code: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        mpesaCode: code,
        updatedAt: Timestamp.now()
      });
      showNotification('M-Pesa code updated', 'success');
    } catch (error) {
      console.error('Failed to update M-Pesa code:', error);
      showNotification('Failed to update M-Pesa code', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.phoneNumber.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-display text-primary">Orders Management</h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Process guest & customer orders</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-stone-100 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-gold luxury-shadow-sm w-full sm:w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-white border border-stone-100 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-gold luxury-shadow-sm transition-all"
          >
            <option value="all">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white luxury-shadow text-stone-300">
                <ShoppingBag className="mx-auto mb-4 opacity-10" size={48} />
                <p className="text-[10px] uppercase tracking-widest font-black">No active orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    "bg-white p-6 luxury-shadow border-l-4 transition-all cursor-pointer group",
                    order.status === 'Pending Confirmation' ? "border-amber-400" : "border-transparent",
                    selectedOrder?.id === order.id ? "ring-2 ring-gold ring-inset" : "hover:scale-[1.01]"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{order.orderId}</p>
                      <h4 className="font-display text-primary text-xl">{order.fullName}</h4>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                    )}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Quantity</p>
                      <p className="text-xs font-bold text-primary">{order.items.length} Items</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Destination</p>
                      <p className="text-xs font-bold text-primary truncate">{order.town}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Total Value</p>
                      <p className="text-xs font-bold text-gold">KES {order.total.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Order Date</p>
                      <p className="text-xs font-bold text-primary">
                        {order.createdAt?.toDate().toLocaleDateString('en-KE', { day: '2-digit', month: 'short' }) || 'Recent'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 luxury-shadow sticky top-32 space-y-8 no-scrollbar max-h-[calc(100vh-160px)] overflow-y-auto"
              >
                <div className="flex justify-between items-center border-b border-stone-100 pb-6">
                  <div>
                    <h3 className="font-display text-2xl text-primary">Order Detail</h3>
                    <p className="text-[8px] uppercase tracking-widest text-stone-400 font-black mt-1">Status: {selectedOrder.status}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-stone-300 hover:text-stone-500">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-stone-50 border border-stone-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <MessageCircle size={16} />
                      </div>
                      <span className="text-sm font-bold text-primary">{selectedOrder.phoneNumber}</span>
                      <a 
                        href={`https://wa.me/${selectedOrder.phoneNumber.replace(/^0/, '254')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ml-auto p-2 bg-primary text-white rounded-lg hover:bg-gold transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Shipping Address</p>
                       <p className="text-xs text-primary leading-relaxed">
                        {selectedOrder.address}, {selectedOrder.town}, {selectedOrder.county}
                      </p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="pt-2">
                        <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Customer Notes</p>
                        <p className="text-[10px] text-stone-400 italic">"{selectedOrder.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Workflow Management</p>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.keys(STATUS_COLORS).map(status => {
                        const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
                        return (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                            className={cn(
                              "flex items-center gap-3 p-3 text-[9px] font-black uppercase tracking-widest border transition-all",
                              selectedOrder.status === status 
                                ? "bg-primary text-white border-primary luxury-shadow-sm" 
                                : "bg-white text-stone-400 border-stone-100 hover:border-gold hover:text-gold"
                            )}
                          >
                            <Icon size={14} />
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-stone-100">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Financial Verification</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                        <input
                          key={selectedOrder.id}
                          type="text"
                          placeholder="M-Pesa Code"
                          defaultValue={selectedOrder.mpesaCode || ''}
                          id="mpesa-input"
                          className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-100 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-gold placeholder:text-stone-300"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const input = document.getElementById('mpesa-input') as HTMLInputElement;
                          const code = input.value.toUpperCase();
                          if (code) {
                            updateMpesaCode(selectedOrder.id, code);
                            updateOrderStatus(selectedOrder.id, 'Paid');
                          }
                        }}
                        className="bg-emerald-500 text-white px-4 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                      >
                        Verify
                      </button>
                    </div>
                    {selectedOrder.mpesaCode ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Transaction Recorded</p>
                          <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-none font-black">{selectedOrder.mpesaCode}</span>
                        </div>
                        <p className="text-[8px] text-emerald-500 uppercase font-bold tracking-widest">Awaiting Admin Confirmation to mark as Paid.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100">
                        <p className="text-[9px] text-amber-600 font-black uppercase tracking-widest text-center italic">No M-Pesa code submitted by customer yet.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-stone-100">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Package Review</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-2 hover:bg-stone-50 transition-colors">
                          <div className="w-12 h-16 bg-stone-100 border border-stone-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-widest truncate">{item.name}</h5>
                            <p className="text-[9px] text-stone-400 font-bold uppercase mt-1">
                              {item.quantity} × KES {item.price.toLocaleString()}
                            </p>
                            {item.size && <span className="text-[8px] text-gold font-black uppercase mt-0.5">Size: {item.size}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white p-12 luxury-shadow flex flex-col items-center justify-center text-center space-y-6 h-[400px] sticky top-32">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-100">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-stone-300">Awaiting Selection</h3>
                  <p className="text-stone-300 text-[10px] uppercase tracking-widest font-black mt-2">Select an order entry to inspect records</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

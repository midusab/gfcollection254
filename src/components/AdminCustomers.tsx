import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { Search, User, Mail, Calendar, Shield, MoreVertical, Loader2, MapPin, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Customer {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
  lastLogin: any;
  role?: string;
  phoneNumber?: string;
  location?: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Customer[];
      setCustomers(users);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-300">Scanning Customer Matrix</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-display text-primary">Customers</h2>
          <p className="text-stone-400 text-sm mt-1">Manage your boutique's community of {customers.length} users.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-100 p-4 pl-12 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-gold luxury-shadow transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <motion.div 
            layout
            key={customer.uid}
            className="bg-white p-6 luxury-shadow border border-stone-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-gold/20 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100">
                <img 
                  src={customer.photoURL || `https://ui-avatars.com/api/?name=${customer.displayName || customer.email}&background=00234b&color=fff`} 
                  alt={customer.displayName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display text-primary">{customer.displayName || 'Anonymous Muse'}</h3>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 flex-1 max-w-2xl">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-300">Last Active</p>
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Calendar size={14} className="text-gold" />
                  {customer.lastLogin?.toDate ? customer.lastLogin.toDate().toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-300">Joined On</p>
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <User size={14} className="text-gold" />
                  {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div className="space-y-1 hidden md:block">
                <p className="text-[10px] uppercase tracking-widest font-black text-stone-300">Account Type</p>
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Shield size={14} className="text-emerald-500" />
                  <span className="uppercase tracking-widest text-[9px] px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">Standard Account</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-3 hover:bg-stone-50 text-stone-400 hover:text-primary transition-all rounded-xl">
                <ShoppingBag size={20} />
              </button>
              <button className="p-3 hover:bg-stone-50 text-stone-400 hover:text-primary transition-all rounded-xl">
                <MoreVertical size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-white p-20 text-center luxury-shadow border border-dashed border-stone-200">
          <User className="mx-auto text-stone-100 mb-6" size={60} />
          <h3 className="text-xl font-display text-stone-300">No customers found matching your criteria</h3>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, CreditCard, Package, Users, DollarSign, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    pendingDelivery: 0
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      let pending = 0;
      let paid = 0;
      let delivered = 0;
      let todayRev = 0;
      let monthlyRev = 0;
      let pendingDel = 0;

      const dailyRevMap = new Map();

      snapshot.docs.forEach(doc => {
        const order = doc.data();
        const date = order.createdAt?.toDate() || new Date();
        const status = order.status;

        total++;
        if (status === 'Pending Confirmation') pending++;
        if (['Paid', 'Processing', 'Out for Delivery', 'Delivered'].includes(status)) {
          paid++;
          if (date >= startOfMonth) monthlyRev += order.total;
          if (date >= startOfToday) todayRev += order.total;
        }
        if (status === 'Delivered') delivered++;
        if (status === 'Processing' || status === 'Out for Delivery') pendingDel++;

        // For revenue chart (past 7 days)
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        dailyRevMap.set(dateStr, (dailyRevMap.get(dateStr) || 0) + order.total);
      });

      setStats({
        totalOrders: total,
        pendingPayments: pending,
        paidOrders: paid,
        deliveredOrders: delivered,
        todayRevenue: todayRev,
        monthlyRevenue: monthlyRev,
        pendingDelivery: pendingDel
      });

      const chartData = Array.from(dailyRevMap.entries()).map(([name, value]) => ({ name, value })).reverse();
      setRevenueData(chartData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 luxury-shadow relative overflow-hidden group"
    >
      <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 transition-transform group-hover:scale-110", color)}>
        <Icon size={96} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-xl", color.replace('text-', 'bg-').replace('500', '50'))}>
          <Icon size={20} className={color} />
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-400">{title}</p>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-display text-primary">{typeof value === 'number' && title.includes('Revenue') ? `KES ${value.toLocaleString()}` : value}</h3>
        {trend && (
           <div className={cn("flex items-center gap-1 text-[10px] font-bold", trend > 0 ? "text-emerald-500" : "text-stone-300")}>
             {trend > 0 ? <TrendingUp size={12} /> : <Clock size={12} />}
             <span>{trend > 0 ? `+${trend}%` : 'Stable'}</span>
           </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display text-primary">Executive Summary</h2>
        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Real-time performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={stats.todayRevenue} icon={DollarSign} color="text-gold" trend={12} />
        <StatCard title="Monthly Revenue" value={stats.monthlyRevenue} icon={TrendingUp} color="text-primary" trend={8} />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={Clock} color="text-amber-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-stone-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 luxury-shadow space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-display text-primary">Revenue Trends</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Past 7 Days Performance</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className="text-[10px] font-bold text-stone-400 uppercase">Revenue (KES)</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#A8A29E' }}
                  tickFormatter={(val) => `KES ${val >= 1000 ? (val/1000)+'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#1C1C1C' }}
                  itemStyle={{ fontSize: 12, fontWeight: 600, color: '#C5A059' }}
                />
                <Area type="monotone" dataKey="value" stroke="#C5A059" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 luxury-shadow space-y-8">
           <div>
              <h3 className="text-lg font-display text-primary">Operations Status</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Logistics & Fulfilment</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-stone-50 border-l-4 border-amber-400">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary">Pending Payment</h4>
                    <p className="text-[10px] text-stone-400">{stats.pendingPayments} actions required</p>
                  </div>
                </div>
                <div className="text-lg font-display text-amber-600">{stats.pendingPayments}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 border-l-4 border-indigo-400">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Package size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary">Processing</h4>
                    <p className="text-[10px] text-stone-400">{stats.pendingDelivery} ready for transit</p>
                  </div>
                </div>
                <div className="text-lg font-display text-indigo-600">{stats.pendingDelivery}</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 border-l-4 border-emerald-400">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary">Delivered</h4>
                    <p className="text-[10px] text-stone-400">Successful completions</p>
                  </div>
                </div>
                <div className="text-lg font-display text-emerald-600">{stats.deliveredOrders}</div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gold mb-4">
                <AlertTriangle size={14} />
                <span>Inventory Alerts</span>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-red-600">Stock Threshold reached</p>
                <p className="text-[9px] text-red-400 leading-tight">3 products are nearly sold out. Recommended restock immediately.</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

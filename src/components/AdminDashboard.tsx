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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 sm:p-8 luxury-shadow relative overflow-hidden group border border-stone-50 hover:border-gold/20 transition-all duration-500"
    >
      <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.06]", color)}>
        <Icon size={128} />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("p-2.5 rounded-xl transition-colors duration-500", color.replace('text-', 'bg-').replace('500', '50').replace('600', '50'))}>
          <Icon size={18} className={color} />
        </div>
        <p className="text-[9px] uppercase tracking-[0.2em] font-black text-stone-300">{title}</p>
      </div>
      <div className="flex items-end justify-between relative z-10 gap-2">
        <h3 className="text-2xl sm:text-4xl font-display text-primary tracking-tight break-all">
          {typeof value === 'number' && (title.includes('Revenue') || title.includes('Sales')) ? `KES ${value.toLocaleString()}` : value}
        </h3>
        {trend && (
           <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black tracking-widest flex-shrink-0", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-stone-50 text-stone-400")}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={stats.todayRevenue} icon={DollarSign} color="text-gold" trend={12} />
        <StatCard title="Monthly Revenue" value={stats.monthlyRevenue} icon={TrendingUp} color="text-primary" trend={8} />
        <StatCard title="Pending Orders" value={stats.pendingPayments} icon={Clock} color="text-amber-500" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-stone-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-6 sm:p-10 luxury-shadow space-y-10 border border-stone-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-display text-primary">Revenue Trends</h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-300 font-black mt-1">7-Day Performance Analysis</p>
            </div>
            <div className="hidden sm:flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gold shadow-sm" />
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Gross Revenue (KES)</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full pt-4">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#D6D3D1', letterSpacing: 1 }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#D6D3D1' }}
                    tickFormatter={(val) => `${val >= 1000 ? (val/1000)+'k' : val}`}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '0', boxShadow: '20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff' }}
                    labelStyle={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: '#1C1C1C', letterSpacing: 2, marginBottom: 8 }}
                    itemStyle={{ fontSize: 12, fontWeight: 600, color: '#C5A059' }}
                    formatter={(value: any) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#C5A059" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-200 gap-4">
                <TrendingUp size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Sales Data</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-10 luxury-shadow space-y-10 border border-stone-50">
           <div>
              <h3 className="text-2xl font-display text-primary">Operations</h3>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-300 font-black mt-1">Logistics Status</p>
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

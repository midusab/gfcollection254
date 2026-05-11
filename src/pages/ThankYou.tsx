import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, MessageCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { PAYMENT_DETAILS } from '../constants/payment';

export default function ThankYou() {
  const location = useLocation();
  const orderData = location.state?.orderData;

  if (!orderData) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white luxury-shadow p-8 md:p-16 border border-stone-100 text-center space-y-12"
        >
          {/* Success Header */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-display text-primary">Order Received</h1>
            <p className="text-stone-400 text-sm uppercase tracking-[0.2em] font-black">Order ID: {orderData.orderId}</p>
          </div>

          <div className="h-px bg-stone-100 w-full" />

          {/* Payment Instructions */}
          <div className="space-y-8 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <CreditCard size={20} />
              </div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-primary">Payment Required</h3>
            </div>

            <div className="bg-stone-50 p-8 border border-stone-100 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Send Funds To:</p>
                <p className="text-xl font-display text-primary">{PAYMENT_DETAILS.type}</p>
                <p className="text-2xl font-display text-gold tracking-tighter">{PAYMENT_DETAILS.number}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Name: {PAYMENT_DETAILS.name}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-stone-200">
                <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">Instructions:</p>
                {PAYMENT_DETAILS.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 text-[10px] text-stone-500 font-bold uppercase tracking-tighter">
                    <span className="text-gold">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center py-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Your payment is secured by manual verification</p>
            </div>
          </div>

          <div className="h-px bg-stone-100 w-full" />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/profile"
              className="bg-primary text-white py-5 px-8 flex items-center justify-center gap-3 group transition-all hover:bg-gold"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-black">Track Order</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href={`https://wa.me/254740275625?text=Hello, my Order ID is ${orderData.orderId}. I have a question about my payment.`}
              target="_blank"
              rel="noreferrer"
              className="bg-white border border-stone-200 text-stone-400 py-5 px-8 flex items-center justify-center gap-3 hover:text-primary transition-all"
            >
              <MessageCircle size={16} />
              <span className="text-[10px] uppercase tracking-[0.3em] font-black">WhatsApp Help</span>
            </a>
          </div>

          <Link to="/shop" className="inline-block text-[10px] uppercase tracking-widest font-black text-stone-300 hover:text-gold transition-colors">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

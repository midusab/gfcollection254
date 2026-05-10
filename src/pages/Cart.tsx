import { useCartStore } from '../store';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-8">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-10 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest collection and find something you'll love!
        </p>
        <Link 
          to="/shop" 
          className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <ArrowLeft size={20} />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-black text-gray-900 mb-10 flex items-center gap-4">
          <ShoppingBag className="text-primary" size={36} />
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-700">{items.length} Items</span>
                <Link to="/shop" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                  <Plus size={14} /> Add more
                </Link>
              </div>

              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 flex flex-col sm:flex-row items-center gap-6 group"
                  >
                    <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <div className="pt-2">
                        <span className="text-lg font-black text-primary">KES {item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-4">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* MMUST Delivery Info */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                <Truck size={32} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">Nationwide Shipping</h4>
                <p className="text-sm text-gray-600">Secure delivery to any location in Kenya via G4S or Wells Fargo. Free shipping on orders above KES 5,000.</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl sticky top-28">
              <h3 className="text-2xl font-display font-black text-gray-900 mb-8 pb-4 border-b border-gray-100">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-primary">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-bold text-gray-900">KES 0</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-black text-primary">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 mb-4 flex items-center justify-center gap-3"
              >
                Checkout Now
              </Link>
              
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Secure Payment Powered by M-Pesa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

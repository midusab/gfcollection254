import React, { useState } from 'react';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronRight, MessageCircle, ShieldCheck, Truck, ChevronLeft, Loader2, User } from 'lucide-react';
import { cn } from '../lib/utils';

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta', 
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 
  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 
  'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 
  'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
];

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phoneNumber: '',
    county: '',
    town: '',
    address: '',
    notes: ''
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const deliveryFee = total > 5000 ? 0 : 350;
  const grandTotal = total + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = (orderId: string, orderData: any) => {
    const itemsList = orderData.items.map((item: any, idx: number) => 
      `${idx + 1}. ${item.name}\n   Qty: ${item.quantity}\n   Price: KES ${item.price.toLocaleString()}`
    ).join('\n\n');

    const message = `Hello GF Collection 👗

I want to place an order.

Order ID: ${orderId}

Customer:
Name: ${orderData.fullName}
Phone: ${orderData.phoneNumber}
Location: ${orderData.county}, ${orderData.town}
Address: ${orderData.address || 'Not specified'}

Items:
${itemsList}

Subtotal: KES ${orderData.subtotal.toLocaleString()}
Delivery Fee: KES ${orderData.deliveryFee.toLocaleString()}
Total: KES ${orderData.total.toLocaleString()}

Please confirm availability and payment details.`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const year = new Date().getFullYear();
      const orderNumber = Math.floor(1000 + Math.random() * 9000);
      const orderId = `GF-${year}-${orderNumber}`;

      const orderData = {
        orderId,
        userId: user?.uid || null,
        ...formData,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image
        })),
        subtotal: total,
        deliveryFee,
        total: grandTotal,
        status: 'Pending Confirmation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firestore
      try {
        await addDoc(collection(db, 'orders'), orderData);
      } catch (error: any) {
        const errInfo = {
          error: error.message,
          operationType: 'create',
          path: 'orders',
          authInfo: {
            userId: user?.uid,
            email: user?.email,
            emailVerified: user?.emailVerified
          }
        };
        console.error('Firestore Error:', JSON.stringify(errInfo));
        throw new Error(JSON.stringify(errInfo));
      }

      // Generate WhatsApp Link
      const waMessage = generateWhatsAppMessage(orderId, orderData);
      const waNumber = '254740275625'; // GF Collection business number
      const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

      showNotification('Order recorded! Opening WhatsApp to confirm...', 'success');

      // Open WhatsApp
      window.open(waLink, '_blank');

      // Clear Cart and Redirect
      clearCart();
      navigate('/shop'); 
      
    } catch (error) {
      console.error('Order submission failed:', error);
      showNotification('Something went wrong. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => navigate('/cart')} className="p-2 hover:bg-white rounded-full transition-colors text-primary">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-display text-primary">Secure Checkout</h1>
            <p className="text-gray-500 text-sm">Review your details and confirm your order via WhatsApp.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 luxury-shadow">
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <User size={16} />
                  </div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Mary Achieng"
                      className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Phone Number (M-Pesa)</label>
                    <input
                      required
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <Truck size={16} />
                  </div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Shipping Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">County</label>
                    <select
                      required
                      name="county"
                      value={formData.county}
                      onChange={handleInputChange}
                      className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select County</option>
                      {KENYA_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Town / Estate</label>
                    <input
                      required
                      type="text"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      placeholder="e.g. Kakamega, MMUST"
                      className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Specific Address / Pickup Description</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Near Mega Mall, Blue Door Apartment Room 4"
                    rows={3}
                    className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Extra Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific requests for your order?"
                    rows={2}
                    className="w-full bg-stone-50 border border-stone-200 p-4 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-gold text-white py-6 px-8 flex items-center justify-center gap-4 transition-all duration-500 luxury-shadow group disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-xs uppercase tracking-[0.3em] font-bold text-stone-200">Processing Order...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    <span className="text-xs uppercase tracking-[0.3em] font-bold">Confirm Order via WhatsApp</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-4 pt-4 text-stone-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Secure Verification</span>
                </div>
                <div className="w-1 h-1 bg-stone-300 rounded-full" />
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Personal Support</span>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 luxury-shadow sticky top-32 space-y-8">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-primary border-b border-stone-100 pb-4">Order Summary</h3>
              
              <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-4 pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-stone-100 p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-[10px] font-bold text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                      <p className="text-xs font-display text-gold">KES {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-primary font-bold">KES {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className={cn("font-bold", deliveryFee === 0 ? "text-green-500" : "text-primary")}>
                    {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-display text-primary">KES {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl space-y-2 border border-stone-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gold">Next Steps:</p>
                <ol className="text-[10px] text-gray-500 space-y-1 pl-4 list-decimal">
                  <li>Click confirm to open WhatsApp</li>
                  <li>Our team will verify availability</li>
                  <li>Receive M-Pesa payment details</li>
                  <li>Send code to complete order</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../mockData';
import { useCartStore } from '../store';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Heart, Share2, Loader2, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useMemo, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInLoading } = useAuth();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const product = products.find(p => p.id === id);

  const completeTheLook = useMemo(() => {
    if (!product) return [];
    // Curated recommendations based on category
    const items = [];
    if (product.category === 'Clothing') {
      const bag = products.find(p => p.category === 'Bags');
      const shoes = products.find(p => p.category === 'Shoes');
      if (bag) items.push(bag);
      if (shoes) items.push(shoes);
    } else if (product.category === 'Bags' || product.category === 'Shoes') {
      const clothing = products.find(p => p.category === 'Clothing');
      const accessory = products.find(p => p.category === 'Accessories');
      if (clothing) items.push(clothing);
      if (accessory) items.push(accessory);
    } else {
      const clothing = products.find(p => p.category === 'Clothing');
      const bag = products.find(p => p.category === 'Bags');
      if (clothing) items.push(clothing);
      if (bag) items.push(bag);
    }
    return items;
  }, [product]);

  useEffect(() => {
    if (!user || !product) return;

    const wishlistRef = doc(db, 'wishlists', user.uid, 'items', product.id);
    const unsubscribe = onSnapshot(wishlistRef, (doc) => {
      setIsInWishlist(doc.exists());
    });

    return unsubscribe;
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    const wishlistRef = doc(db, 'wishlists', user.uid, 'items', product.id);

    try {
      if (isInWishlist) {
        await deleteDoc(wishlistRef);
      } else {
        await setDoc(wishlistRef, {
          productId: product.id,
          userId: user.uid,
          addedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige">
        <div className="text-center">
          <h2 className="text-2xl font-display mb-4">Product not found</h2>
          <button onClick={() => navigate('/shop')} className="text-gold font-bold uppercase tracking-widest text-[10px]">Back to Boutique</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-beige min-h-screen pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary/50 hover:text-gold transition-colors mb-12 font-bold uppercase tracking-widest text-[10px]"
        >
          <ArrowLeft size={16} />
          <span>Return</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-[3/4] overflow-hidden bg-white luxury-shadow">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-white overflow-hidden cursor-pointer border border-transparent hover:border-gold transition-all luxury-shadow p-1">
                  <img 
                    src={product.image} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover opacity-60 hover:opacity-100" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] text-gold font-bold uppercase tracking-[0.3em]">
                  {product.category}
                </span>
                <button className="text-primary/30 hover:text-gold transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display text-primary mb-6 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-1 text-gold">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-gold" />)}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.reviews} Authenticated Reviews</span>
              </div>

              <div className="flex items-baseline gap-4 mb-10 border-b border-stone-200 pb-10">
                <span className="text-4xl font-display font-medium text-primary tracking-tight">KES {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through font-light">KES {product.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-12 font-light font-sans">
                "{product.description} A centerpiece from GF, tailored for the woman who owns every room she enters."
              </p>
            </div>

            {/* Selection */}
            <div className="space-y-10 mb-12">
              <div>
                <h3 className="font-bold text-primary mb-6 uppercase tracking-[0.2em] text-[10px]">Select Size</h3>
                <div className="flex gap-4">
                  {['S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-none border text-xs font-bold transition-all flex items-center justify-center tracking-widest ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-white luxury-shadow' 
                          : 'border-stone-200 text-gray-400 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-6 mb-16">
              <button 
                onClick={() => addItem(product)}
                className="flex-1 bg-primary hover:bg-gold text-white py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95 luxury-shadow"
              >
                <ShoppingCart size={18} />
                Add to Boutique Cart
              </button>
              <button 
                onClick={toggleWishlist}
                disabled={wishlistLoading || signInLoading}
                className={cn(
                  "px-6 border transition-all flex items-center justify-center min-w-[70px]",
                  isInWishlist 
                    ? "bg-gold border-gold text-white" 
                    : "border-stone-200 text-gray-400 hover:text-gold hover:border-gold",
                  (wishlistLoading || signInLoading) && "opacity-50 cursor-not-allowed"
                )}
              >
                {wishlistLoading || (!user && signInLoading) ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Heart size={20} className={isInWishlist ? "fill-white" : ""} />
                )}
              </button>
            </div>

            {/* Trust Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-12 border-t border-stone-200">
              <div className="flex flex-col items-center text-center gap-4">
                <Truck size={20} strokeWidth={1} className="text-gold" />
                <div className="text-[9px] font-bold uppercase tracking-widest text-primary/50">Nationwide Shipping</div>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <RefreshCcw size={20} strokeWidth={1} className="text-gold" />
                <div className="text-[9px] font-bold uppercase tracking-widest text-primary/50">7-Day Return Service</div>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <ShieldCheck size={20} strokeWidth={1} className="text-gold" />
                <div className="text-[9px] font-bold uppercase tracking-widest text-primary/50">Authentic Luxury</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Complete the Look Section */}
        {completeTheLook.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 pt-20 border-t border-stone-200"
          >
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold block mb-4">Curated Styling</span>
                <h2 className="text-4xl font-display text-primary">Complete The Look</h2>
              </div>
              <p className="text-gray-500 max-w-sm text-sm font-light leading-relaxed">
                Our stylists have curated these pairings to help you achieve the perfect GF aesthetic for your next event.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-8 bg-white p-8 md:p-16 luxury-shadow relative overflow-hidden">
              {/* Decorative background text */}
              <div className="absolute top-0 right-0 text-[120px] font-display font-bold text-stone-50 opacity-[0.03] select-none pointer-events-none -translate-y-1/4 translate-x-1/4">
                STYLED
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 w-full lg:w-3/4">
                {/* Main Product Thumbnail */}
                <div className="flex flex-col items-center gap-4 group">
                  <div className="w-32 h-44 md:w-48 md:h-64 bg-beige p-2 luxury-shadow overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-primary/40">Current Item</span>
                </div>

                <div className="text-gold opacity-30">
                  <Plus size={32} strokeWidth={1} />
                </div>

                {/* Recommended Items */}
                {completeTheLook.map((item, idx) => (
                  <Fragment key={item.id}>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <Link to={`/product/${item.id}`} className="w-32 h-44 md:w-48 md:h-64 bg-beige p-2 luxury-shadow overflow-hidden block">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                      </Link>
                      <div className="text-center">
                        <p className="text-[9px] uppercase tracking-widest font-bold text-gold mb-1">{item.category}</p>
                        <p className="text-[10px] font-medium text-primary line-clamp-1 max-w-[120px]">{item.name}</p>
                      </div>
                    </motion.div>
                    {idx < completeTheLook.length - 1 && (
                      <div className="text-gold opacity-30">
                        <Plus size={32} strokeWidth={1} />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              <div className="w-full lg:w-1/4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-stone-100 pt-8 lg:pt-0 lg:pl-12">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Look Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Full Set (3 items)</span>
                      <span className="font-bold text-primary">
                        KES {(product.price + completeTheLook.reduce((acc, item) => acc + item.price, 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    addItem(product);
                    completeTheLook.forEach(item => addItem(item));
                  }}
                  className="w-full bg-primary hover:bg-gold text-white py-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all luxury-shadow flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={14} />
                  Add Full Look
                </button>
                <div className="flex items-center gap-2 text-gold">
                  <ShieldCheck size={14} />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Styled by GF Concierge</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

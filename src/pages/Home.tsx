import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { db } from '../lib/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { 
  ArrowRight, 
  Truck, 
  Star as StarIcon, 
  MessageCircle,
  Gem,
  Award,
  Heart,
  MapPin,
  Clock,
  Briefcase,
  GlassWater,
  PartyPopper,
  Zap,
  Plus,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const collections = [
  { 
    name: 'Official', 
    description: 'Empower your professional journey with executive elegance.',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop',
    icon: Briefcase,
    color: 'bg-stone-100'
  },
  { 
    name: 'Casuals', 
    description: 'Effortless style for your everyday moments.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop',
    icon: Zap,
    color: 'bg-gold/10'
  },
  { 
    name: 'Photoshoot', 
    description: 'Captivate the lens in our exquisite photoshoot gowns.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    icon: PartyPopper,
    color: 'bg-primary text-white'
  }
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Corporate Executive',
    text: 'GF is truly the power house of fashion. The quality of the office blazer I bought is unmatched. I feel so confident every time I wear it.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Brenda K.',
    role: 'Fashion Influencer',
    text: 'The evening gown I wore for my gala dinner was a showstopper! Everyone kept asking where I got it. Fast delivery to Nairobi too!',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Anita L.',
    role: 'Legal Associate',
    text: 'I love how modern and classy the designs are. It\'s hard to find high-end African fashion this accessible. 10/10 service.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop'
  }
];

export default function Home() {
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'published'),
      where('isBestSeller', '==', true),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBestSellers(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bestsellers:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-beige">
      <Hero />

      {/* Featured Collections Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold"
            >
              Curated Excellence
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display mt-4 leading-tight"
            >
              Signature <br />
              <span>Collections</span>
            </motion.h2>
          </div>
          <p className="text-gray-500 max-w-xs text-sm font-light leading-relaxed pb-2">
            Hand-picked selections designed to empower your professional and social journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden aspect-[4/5] bg-stone-100"
            >
              <img 
                src={col.image} 
                alt={col.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent flex flex-col justify-end p-8 text-white">
                <col.icon className="text-gold mb-6" size={32} strokeWidth={1} />
                <h3 className="text-3xl font-display mb-2 tracking-tight">{col.name}</h3>
                <p className="text-xs text-white/60 mb-8 font-light max-w-[80%] leading-relaxed tracking-wider uppercase">{col.description}</p>
                <Link to="/shop" className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-3 group-hover:gap-5 transition-all text-gold">
                  Explore Now <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Brand Section - Editorial Split */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="absolute left-0 top-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 items-end"
          >
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden luxury-shadow">
                <img 
                  src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600&auto=format&fit=crop" 
                  alt="Fashion" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="aspect-square overflow-hidden luxury-shadow grayscale hover:grayscale-0 transition-all duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop" 
                  alt="Detail" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="aspect-[3/5] overflow-hidden luxury-shadow">
              <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop" 
                alt="Model" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:pl-10"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold block mb-8">Our Legacy</span>
            <h2 className="text-5xl md:text-7xl font-display mb-10 leading-[0.9]">
              The Power House <br />
              <span className="font-light">of Fashion</span>
            </h2>
            <div className="space-y-8 mb-16">
              <p className="text-gray-600 text-lg leading-relaxed font-light font-sans">
                GF is the premier destination for high-fashion in Kakamega, bringing classy, elegant, and modern dresses to women who want to stand out confidently.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed font-light font-sans border-l-2 border-gold pl-6">
                "We don't just sell clothes; we architect confidence for the modern Kenyan woman."
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-light font-sans">
                Founded on the principles of curated excellence, we specialize in high-end office settings, gala dinners, wedding guest attire, and everyday luxury. Our piece reaches every corner of Kenya, delivering confidence in every stitch.
              </p>
            </div>
            <Link to="/about" className="bg-primary text-white px-12 py-6 uppercase tracking-[0.3em] font-bold text-[10px] inline-block hover:bg-gold transition-all luxury-shadow">
              The GF Story
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Women Love Section - Bento Grid Style */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">The GF Experience</span>
          <h2 className="text-4xl font-display mt-4">Crafted for Excellence</h2>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200 border border-stone-200 overflow-hidden luxury-shadow"
        >
          {[
            { icon: Truck, label: 'Countrywide Delivery', desc: 'Secure shipping to all 47 counties within 24-48 hours.' },
            { icon: Gem, label: 'Affordable Luxury', desc: 'High-end aesthetics without the inaccessible price tags.' },
            { icon: Zap, label: 'Trendy Designs', desc: 'Weekly drops of the latest international fashion trends.' },
            { icon: Award, label: 'Quality Selection', desc: 'Hand-picked premium fabrics that last for seasons.' },
            { icon: Heart, label: 'Elegant Styling', desc: 'Curated specifically for sophisticated and modern tastes.' },
            { icon: MessageCircle, label: 'Direct WhatsApp Sales', desc: 'Personal styling and instant ordering via our concierge.' },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="bg-beige hover:bg-white p-12 transition-colors group flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
                <item.icon size={32} strokeWidth={1} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">{item.label}</h4>
              <p className="text-sm text-gray-400 font-light leading-relaxed lowercase tracking-wide">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">Most Coveted</span>
              <h2 className="text-4xl md:text-5xl font-display mt-4">The Boutique Bestsellers</h2>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:text-gold transition-colors">
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 min-h-[400px]">
            {loading ? (
               <div className="col-span-full flex flex-col items-center justify-center space-y-4">
                 <Loader2 className="w-10 h-10 animate-spin text-gold" />
                 <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-300">Fetching Best Sellers</p>
               </div>
            ) : bestSellers.length > 0 ? (
               bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center text-stone-300 py-20">
                <p className="text-[10px] uppercase tracking-widest font-black">No best sellers found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Delivery Section - M-Pesa Vibes */}
      <section className="py-24 bg-beige border-y border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold block mb-6">Logistics & Payments</span>
            <h2 className="text-4xl md:text-5xl font-display mb-8">Effortless Shopping</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white luxury-shadow flex items-center justify-center text-gold mb-6">
                <Truck size={24} />
              </div>
              <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-4">Nationwide Coverage</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">Delivering elegance to your doorstep across Kenya. From Kakamega to Mombasa, Nairobi to Kisumu.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white luxury-shadow flex items-center justify-center text-gold font-bold mb-6">
                K
              </div>
              <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-4">Secure M-Pesa Payments</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">Fast, secure and easy checkout via M-Pesa. Shop with confidence using Kenya's trusted payment method.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white luxury-shadow flex items-center justify-center text-green-600 mb-6">
                <MessageCircle size={24} />
              </div>
              <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-4">Personalized WhatsApp Sales</h4>
              <p className="text-gray-500 text-sm font-light leading-relaxed">Need help styling? Our personal shoppers are available on WhatsApp for direct orders and advice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">IG Moments</span>
          <h2 className="text-4xl md:text-5xl font-display mt-4">#GFAffair</h2>
        </div>
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2"
        >
          {[
            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549439602-43ebcb232811?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=400&auto=format&fit=crop'
          ].map((url, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
              }}
              whileHover={{ scale: 0.98 }}
              className="aspect-[4/5] bg-stone-200 overflow-hidden relative cursor-pointer group"
            >
              <img src={url} alt="Gallery" className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] text-white uppercase tracking-widest font-bold">View Post</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="pb-24 pt-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto glass p-12 md:p-20 grid grid-cols-1 lg:grid-cols-2 gap-20 rounded-none luxury-shadow">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold block mb-6">Get in Touch</span>
            <h2 className="text-4xl md:text-6xl font-display mb-10 leading-tight">Visit the Boutique</h2>
            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <MapPin className="text-gold flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-2">Boutique Location</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">Kakamega, Masinde Muliro University <br />Gate B Branch, Western Kenya.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <Clock className="text-gold flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-2">Showroom Hours</h4>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">Mon - Sat: 09:00 AM - 08:00 PM <br />Sun: By Appointment Only</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <MessageCircle className="text-gold flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-primary uppercase text-xs tracking-widest mb-2">WhatsApp Support</h4>
                  <p className="text-primary font-bold text-xl leading-relaxed">+254 740 275 625</p>
                  <p className="text-gray-400 text-xs mt-1">Direct ordering & style consultation</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex gap-4">
              <a href="https://wa.me/254740275625" className="bg-green-600 text-white px-8 py-4 uppercase tracking-widest font-bold text-[10px] flex items-center gap-3">
                <MessageCircle size={16} /> WhatsApp Now
              </a>
              <a href="#" className="border border-primary text-primary px-8 py-4 uppercase tracking-widest font-bold text-[10px]">
                Email Us
              </a>
            </div>
          </div>
          
          <div className="relative h-[400px] lg:h-full min-h-[400px] bg-stone-100 overflow-hidden luxury-shadow grayscale-[30%] hover:grayscale-0 transition-all duration-1000">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <MapPin size={48} className="text-gold mb-4 animate-bounce" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">MMUST Gate B, Kakamega</span>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1524666041070-9d87656c25bb?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" alt="Map View" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Floating WhatsApp CTA */}
      <motion.a 
        href="https://wa.me/254740275625"
        className="fixed bottom-10 right-10 z-40 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-colors flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        <MessageCircle size={30} fill="currentColor" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 shadow-sm border border-white"></span>
        </span>
      </motion.a>
    </div>
  );
}

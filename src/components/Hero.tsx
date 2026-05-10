import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [content, setContent] = useState({
    title: 'Sophisticated Elegance',
    subtitle: 'Classy Dresses, Luxury Bags & Stylish Shoes for Modern Kenyan Women',
    cta: 'Shop Collection',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop'
  });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'config'));
        if (docSnap.exists() && docSnap.data().value?.hero) {
          const heroData = docSnap.data().value.hero;
          setContent({
            title: heroData.title || content.title,
            subtitle: heroData.subtitle || content.subtitle,
            cta: heroData.cta || content.cta,
            image: heroData.image || content.image
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHero();
  }, []);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-primary">
      {/* Background with Parallax */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={content.image}
          alt="Luxury Fashion Model"
          className="w-full h-full object-cover object-top opacity-60 grayscale-[20%]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase mb-8 inline-flex text-gold border border-white/10">
              The Power House of Fashion
            </span>
            <h1 className="text-6xl md:text-9xl font-display font-medium text-white leading-[0.8] mb-10 tracking-tight"
                dangerouslySetInnerHTML={{ __html: content.title.replace(' ', ' <br /> ') }}
            />
            <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed font-light font-sans max-w-lg">
              {content.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/shop" 
                className="group relative bg-gold text-white font-bold px-8 py-4 rounded-none overflow-hidden transition-all hover:bg-white hover:text-primary luxury-shadow text-center min-w-[200px]"
              >
                <div className="relative z-10 flex items-center gap-3 justify-center">
                  <span className="text-[10px] uppercase tracking-[0.2em]">{content.cta}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                </div>
              </Link>
              <Link 
                to="/shop?new=true" 
                className="group border border-white/30 text-white font-bold px-8 py-4 rounded-none hover:bg-white hover:text-primary transition-all flex items-center gap-3 justify-center min-w-[200px]"
              >
                <span className="text-[10px] uppercase tracking-[0.2em]">New Arrivals</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements / Parallax Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ opacity }}
        className="absolute bottom-20 right-20 hidden xl:block z-20"
      >
        <div className="flex gap-6">
          <div className="w-48 h-64 bg-white/10 backdrop-blur-md p-2 border border-white/20 transform rotate-6 hover:rotate-0 transition-transform duration-500 luxury-shadow">
            <img 
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=300&auto=format&fit=crop" 
              className="w-full h-full object-cover" 
              alt="Heels" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-48 h-64 bg-white/10 backdrop-blur-md p-2 border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500 luxury-shadow translate-y-12">
            <img 
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300&auto=format&fit=crop" 
              className="w-full h-full object-cover" 
              alt="Bag" 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

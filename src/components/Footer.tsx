import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Slogan */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img src={logo} alt="GF Collection" className="h-16 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-sm font-light text-white/50 leading-relaxed font-sans">
              Kenya's premier luxury destination for sophisticated official wear, effortless casuals, and breathtaking photoshoot gowns. Hand-picked pieces for the modern woman who values elegance.
            </p>
            <div className="flex gap-6 items-center">
              <a href="https://wa.me/254740275625" className="text-white/40 hover:text-gold transition-colors font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="#" className="text-white/40 hover:text-gold transition-colors font-bold text-xs uppercase tracking-widest underline underline-offset-4">TikTok</a>
            </div>
          </div>

          {/* Boutique Departments */}
          <div>
            <h4 className="text-gold font-bold mb-10 text-[10px] uppercase tracking-[0.4em]">Departments</h4>
            <ul className="space-y-5 text-xs font-light tracking-widest uppercase">
              <li><Link to="/shop?category=Clothing&subcategory=Official" className="hover:text-gold transition-colors">Official Wear</Link></li>
              <li><Link to="/shop?category=Clothing&subcategory=Casuals" className="hover:text-gold transition-colors">Casuals</Link></li>
              <li><Link to="/shop?category=Clothing&subcategory=Photoshoot" className="hover:text-gold transition-colors">Photoshoot Gowns</Link></li>
              <li><Link to="/shop?category=Clothing&subcategory=Birthday+Dresses" className="hover:text-gold transition-colors">Birthday Dresses</Link></li>
              <li><Link to="/shop?category=Accessories" className="hover:text-gold transition-colors">Luxury Accessories</Link></li>
            </ul>
          </div>

          {/* Bespoke Service */}
          <div>
            <h4 className="text-gold font-bold mb-10 text-[10px] uppercase tracking-[0.4em]">Customer Care</h4>
            <ul className="space-y-5 text-xs font-light tracking-widest uppercase">
              <li><a href="#" className="hover:text-gold transition-colors">Nationwide Shipping</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Size Assistance</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Returns & Exchanges</a></li>
              <li><a href="https://wa.me/254740275625" className="hover:text-gold transition-colors">Speak to a Stylist</a></li>
            </ul>
          </div>

          {/* Boutique Contact */}
          <div className="space-y-8">
            <h4 className="text-gold font-bold mb-10 text-[10px] uppercase tracking-[0.4em]">Boutique Direct</h4>
            <div className="flex items-start gap-4 group">
              <MapPin size={18} className="text-gold flex-shrink-0 mt-1" />
              <p className="text-xs font-light text-white/70 leading-relaxed uppercase tracking-wider">
                MMUST Gate B, <br /> Kakamega, Kenya
              </p>
            </div>
            <div className="flex items-center gap-4 group">
              <Phone size={18} className="text-gold flex-shrink-0" />
              <p className="text-xs font-bold text-white tracking-widest">+254 740 275 625</p>
            </div>
            <div className="flex items-center gap-4 group">
              <Mail size={18} className="text-gold flex-shrink-0" />
              <p className="text-xs font-light text-white/70 tracking-widest uppercase">concierge@gfcollection.co.ke</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-10 opacity-30">
              <Truck size={24} />
              <CreditCard size={24} />
              <ShieldCheck size={24} />
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-2">
                &copy; {new Date().getFullYear()} GF — The Power House of Fashion.
              </p>
              <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">
                Premium Quality Clothing & Accessories Delivered Nationwide Across Kenya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

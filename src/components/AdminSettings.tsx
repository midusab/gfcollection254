import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { Layout, Image as ImageIcon, Type, Save, Loader2, Globe, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Setting {
  key: string;
  value: any;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({
    hero: {
      title: 'Define Your Elegance',
      subtitle: 'Exquisite Curated Collections',
      cta: 'Explore Now',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'
    },
    announcement: {
      text: 'Free Delivery for orders above KES 5,000',
      enabled: true
    },
    contact: {
      whatsapp: '254740275625',
      instagram: '@gfcollection_ke',
      address: 'Kakamega, Town Center'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data().value);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), {
        key: 'config',
        value: settings,
        updatedAt: serverTimestamp()
      });
      showNotification('Settings saved and live!', 'success');
    } catch (error) {
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedSetting = (key: string, field: string, val: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val
      }
    }));
  };

  if (loading) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display text-primary">Website Configuration</h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Control public content & banners</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-full flex items-center gap-2 hover:bg-gold transition-all luxury-shadow group disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span className="text-[10px] uppercase tracking-widest font-black">Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Banner Settings */}
        <section className="bg-white p-8 luxury-shadow space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <Sparkles size={18} className="text-gold" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary">Hero Banner</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Main Title</label>
              <input 
                type="text" 
                value={settings.hero.title}
                onChange={(e) => updateNestedSetting('hero', 'title', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Subtitle</label>
              <input 
                type="text" 
                value={settings.hero.subtitle}
                onChange={(e) => updateNestedSetting('hero', 'subtitle', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Background Image URL</label>
              <input 
                type="text" 
                value={settings.hero.image}
                onChange={(e) => updateNestedSetting('hero', 'image', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </section>

        {/* Announcement Bar */}
        <section className="bg-white p-8 luxury-shadow space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <Globe size={18} className="text-gold" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary">Announcement Bar</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Announcement Text</label>
              <input 
                type="text" 
                value={settings.announcement.text}
                onChange={(e) => updateNestedSetting('announcement', 'text', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
            <button 
              onClick={() => updateNestedSetting('announcement', 'enabled', !settings.announcement.enabled)}
              className={cn(
                "px-8 py-4 text-xs font-black uppercase tracking-widest border transition-all h-[54px] mt-6 md:mt-[26px]",
                settings.announcement.enabled ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-stone-50 text-stone-400 border-stone-100"
              )}
            >
              {settings.announcement.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </section>

        {/* Business Contact */}
        <section className="bg-white p-8 luxury-shadow space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <MessageCircle size={18} className="text-gold" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-primary">Business Presence</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">WhatsApp Business</label>
              <input 
                type="text" 
                value={settings.contact.whatsapp}
                onChange={(e) => updateNestedSetting('contact', 'whatsapp', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Instagram (@handle)</label>
              <input 
                type="text" 
                value={settings.contact.instagram}
                onChange={(e) => updateNestedSetting('contact', 'instagram', e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

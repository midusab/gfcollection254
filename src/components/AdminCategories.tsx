import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit2, Trash2, Layers, X, Loader2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { showNotification } = useNotification();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    subcategories: [],
    imageUrl: '',
    description: '',
    isActive: true,
    order: 0
  });

  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats.sort((a, b) => a.order - b.order));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        showNotification('Category updated', 'success');
      } else {
        await addDoc(collection(db, 'categories'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        showNotification('Category created', 'success');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showNotification('Operation failed', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subcategories: [],
      imageUrl: '',
      description: '',
      isActive: true,
      order: categories.length
    });
    setEditingCategory(null);
  };

  const addSubcategory = () => {
    if (newSub.trim() && !formData.subcategories?.includes(newSub.trim())) {
      setFormData({
        ...formData,
        subcategories: [...(formData.subcategories || []), newSub.trim()]
      });
      setNewSub('');
    }
  };

  const removeSubcategory = (sub: string) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories?.filter(s => s !== sub)
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-300">Loading Management Suite</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-display text-primary">Manage Categories</h2>
          <p className="text-stone-400 text-sm mt-1">Organize your products into categories and subcategories.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-gold transition-all luxury-shadow"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white luxury-shadow overflow-hidden group border border-stone-50">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                      <Layers size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-display text-primary">{cat.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold">{cat.subcategories.length} Subcategories</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                  className="p-2 hover:bg-stone-50 text-stone-400 transition-colors"
                >
                  {expandedId === cat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div className="h-8 w-px bg-stone-100 mx-2" />
                <button 
                  onClick={() => { setEditingCategory(cat); setFormData(cat); setIsModalOpen(true); }}
                  className="p-2 hover:bg-stone-50 text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={async () => {
                    if(confirm('Delete this category?')) {
                      await deleteDoc(doc(db, 'categories', cat.id));
                      showNotification('Category deleted', 'success');
                    }
                  }}
                  className="p-2 hover:bg-red-50 text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === cat.id && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-stone-50/50"
                >
                  <div className="p-8 border-t border-stone-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-6">Subcategories</h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.subcategories.map(sub => (
                            <span key={sub} className="bg-white border border-stone-100 px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-400 mb-6">Settings</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-stone-400">Status</span>
                            <span className={cat.isActive ? "text-emerald-500" : "text-red-500"}>{cat.isActive ? 'Active' : 'Hidden'}</span>
                          </div>
                          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-stone-400">Display Order</span>
                            <span className="text-primary">{cat.order}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden luxury-shadow relative z-[120] flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display text-primary">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gold mt-1">Fill in the details below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <X size={24} className="text-stone-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Category Name</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Executive Collection"
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Banner Image URL</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                          <input 
                            type="url" 
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-stone-50 border border-stone-100 p-4 pl-12 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Description</label>
                        <textarea 
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Tell the story of this collection..."
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Subcategory Manager</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newSub}
                            onChange={(e) => setNewSub(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategory())}
                            placeholder="Add subcategory..."
                            className="flex-1 bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          />
                          <button 
                            type="button"
                            onClick={addSubcategory}
                            className="bg-primary text-white px-6 font-bold text-xs uppercase"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-4 bg-stone-50 border border-stone-100 min-h-[100px]">
                          {formData.subcategories?.map(sub => (
                            <span key={sub} className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-widest group">
                              {sub}
                              <button onClick={() => removeSubcategory(sub)} className="text-stone-300 hover:text-red-500 transition-colors">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Display Order</label>
                          <input 
                            type="number" 
                            value={formData.order}
                            onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                            className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Live Status</label>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                            className={cn(
                              "w-full p-4 text-[10px] font-black uppercase tracking-widest border transition-all",
                              formData.isActive ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-stone-50 border-stone-200 text-stone-400"
                            )}
                          >
                            {formData.isActive ? 'Active' : 'Archived'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-stone-100 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-primary text-white px-12 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all luxury-shadow"
                    >
                      {editingCategory ? 'Save Changes' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

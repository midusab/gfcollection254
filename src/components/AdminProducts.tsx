import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon, Package, Tag, Layers, Check, X, Loader2, Star, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  stockQuantity: number;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  onSale: boolean;
  status: 'published' | 'draft' | 'out_of_stock';
  tags: string[];
}

const SUBCATEGORIES: Record<string, string[]> = {
  'Clothing': ['Dinner Dresses', 'Office Dresses', 'Event Dresses', 'Birthday Dresses', 'Bodycon Dresses', 'Maxi Dresses', 'Casual Dresses'],
  'Shoes': ['Heels', 'Official Shoes', 'Sneakers', 'Sandals', 'Boots', 'Luxury Heels'],
  'Bags': ['Handbags', 'Office Bags', 'Mini Bags', 'Luxury Bags', 'Crossbody Bags', 'Party Bags', 'Travel Bags'],
  'Accessories': ['Jewelry', 'Belts', 'Hats', 'Others']
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: 'Clothing',
    subcategory: 'Dinner Dresses',
    stockQuantity: 0,
    image: '',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [],
    isFeatured: false,
    isBestSeller: false,
    onSale: false,
    status: 'published',
    tags: []
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    
    // Safety timeout for initial load
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        showNotification('Database connection is taking too long. Check your network or ad-blocker.', 'error');
      }
    }, 7000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
      clearTimeout(timeoutId);
    }, (error) => {
      console.error('Initial load error:', error);
      setLoading(false);
      clearTimeout(timeoutId);
      showNotification(`Connection Error: ${error.message}`, 'error');
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        showNotification('Connection timed out. Please check your internet or ad-blocker.', 'error');
      }
    }, 10000);

    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      console.log("Attempting to save product data:", data);

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), data);
        showNotification('Product updated successfully', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        console.log("Product created with ID:", docRef.id);
        showNotification('Product added successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error: any) {
      console.error('Full Error Object:', error);
      showNotification(`Failed to save: ${error.message}`, 'error');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      showNotification('Product deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete product', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPrice: 0,
      category: 'Clothing',
      stockQuantity: 0,
      image: '',
      images: [],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [],
      isFeatured: false,
      isBestSeller: false,
      onSale: false,
      status: 'published',
      tags: []
    });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display text-primary">Manage Products</h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Add and update your product collection</p>
        </div>
        <button 
          onClick={() => { resetForm(); setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gold transition-all luxury-shadow group"
        >
          <Plus size={18} />
          <span className="text-[10px] uppercase tracking-widest font-black">Add New Product</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-100 luxury-shadow-sm focus:outline-none focus:border-gold text-xs font-bold uppercase tracking-widest"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-6 py-3 bg-white border border-stone-100 luxury-shadow-sm focus:outline-none focus:border-gold text-xs font-bold uppercase tracking-widest"
        >
          <option value="All">All Categories</option>
          <option value="Clothing">Clothing</option>
          <option value="Accessories">Accessories</option>
          <option value="Bags">Bags</option>
          <option value="Shoes">Shoes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map(product => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 luxury-shadow group relative overflow-hidden"
            >
              <div className="flex gap-6">
                <div className="w-24 h-32 bg-stone-100 overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  {product.onSale && (
                    <div className="absolute top-0 right-0 bg-gold text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest">Sale</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="text-[8px] uppercase tracking-widest font-black text-stone-400">{product.category}</p>
                    <div className="flex gap-2">
                       {product.isFeatured && <Star size={12} className="text-gold fill-gold" />}
                       {product.isBestSeller && <TrendingUp size={12} className="text-primary" />}
                    </div>
                  </div>
                  <h4 className="font-display text-lg text-primary line-clamp-1">{product.name}</h4>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-display text-gold">KES {product.price.toLocaleString()}</p>
                    {product.discountPrice && (
                       <p className="text-[10px] text-stone-300 line-through">KES {product.discountPrice.toLocaleString()}</p>
                    )}
                  </div>
                  <p className={cn(
                    "text-[8px] uppercase tracking-[0.2em] font-black",
                    product.stockQuantity < 5 ? "text-red-500" : "text-stone-300"
                  )}>
                    Stock: {product.stockQuantity} Units
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-50 flex justify-between items-center">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  product.status === 'published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  product.status === 'draft' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {product.status.replace('_', ' ')}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(product)} className="p-2 text-stone-400 hover:text-gold transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white luxury-shadow max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-stone-100">
                  <div>
                    <h3 className="text-3xl font-display text-primary">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                    <p className="text-[10px] uppercase tracking-widest font-black text-stone-400 mt-1">Configure product details & inventory</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-300 hover:text-primary transition-colors">
                    <X size={32} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Product Name</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Description</label>
                        <textarea 
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Price (KES)</label>
                          <input 
                            required
                            type="number" 
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                            className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Discount Price</label>
                          <input 
                            type="number" 
                            value={formData.discountPrice}
                            onChange={(e) => setFormData({...formData, discountPrice: Number(e.target.value)})}
                            className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta & Inventory */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Category</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              setFormData({
                                ...formData, 
                                category: newCat,
                                subcategory: SUBCATEGORIES[newCat]?.[0] || ''
                              });
                            }}
                            className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          >
                            <option value="Clothing">Clothing</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Bags">Bags</option>
                            <option value="Shoes">Shoes</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Subcategory</label>
                          <select 
                            value={formData.subcategory}
                            onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                            className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                          >
                            {formData.category && SUBCATEGORIES[formData.category]?.map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Stock Quantity</label>
                        <input 
                          type="number" 
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({...formData, stockQuantity: Number(e.target.value)})}
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Main Image URL</label>
                        <input 
                          required
                          type="url" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-100 p-4 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-stone-400 ml-1">Publication Status</label>
                        <div className="flex gap-2">
                          {['published', 'draft', 'out_of_stock'].map(status => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({...formData, status: status as any})}
                              className={cn(
                                "flex-1 py-3 text-[9px] font-black uppercase tracking-widest border transition-all",
                                formData.status === status ? "bg-primary text-white border-primary" : "bg-white text-stone-400 border-stone-100"
                              )}
                            >
                              {status.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-50 p-6">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 border transition-all",
                        formData.isFeatured ? "bg-white border-gold text-gold" : "bg-transparent border-stone-100 text-stone-400"
                      )}
                    >
                      <Star size={16} className={formData.isFeatured ? "fill-gold" : "fill-none"} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Featured</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isBestSeller: !formData.isBestSeller})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 border transition-all",
                        formData.isBestSeller ? "bg-white border-primary text-primary" : "bg-transparent border-stone-100 text-stone-400"
                      )}
                    >
                      <TrendingUp size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Best Seller</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, onSale: !formData.onSale})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 border transition-all",
                        formData.onSale ? "bg-white border-red-500 text-red-500" : "bg-transparent border-stone-100 text-stone-400"
                      )}
                    >
                      <Tag size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">On Sale</span>
                    </button>
                  </div>

                  <div className="pt-10 border-t border-stone-100">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-gold text-white py-6 text-xs uppercase tracking-[0.4em] font-black luxury-shadow transition-all group disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : (
                        <div className="flex items-center justify-center gap-4">
                          <Check size={20} />
                          <span>{editingProduct ? 'Update Product Catalog' : 'Add Product to Catalog'}</span>
                        </div>
                      )}
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

import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ProductCard } from '../components/ProductCard';
import { Filter, Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['All', 'Clothing', 'Accessories', 'Bags', 'Shoes'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const onSale = searchParams.get('sale') === 'true';

  useEffect(() => {
    // Only fetch published products
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = currentCategory === 'All' || p.category === currentCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSale = !onSale || p.onSale;
      return matchCategory && matchSearch && matchSale;
    });
  }, [currentCategory, searchQuery, onSale, products]);

  const toggleCategory = (category: string) => {
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-black text-gray-900 mb-2">
              {currentCategory === 'All' ? 'Our Collection' : currentCategory}
            </h1>
            <p className="text-gray-500">
              Showing {filteredProducts.length} items
              {searchQuery && <span> for "{searchQuery}"</span>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => {
                  if (e.target.value) {
                    searchParams.set('search', e.target.value);
                  } else {
                    searchParams.delete('search');
                  }
                  setSearchParams(searchParams);
                }}
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-gray-400"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 space-y-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentCategory === cat 
                        ? 'bg-primary text-white font-bold shadow-md' 
                        : 'text-gray-600 hover:bg-white hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Promotions</h3>
              <button
                onClick={() => {
                  if (onSale) {
                    searchParams.delete('sale');
                  } else {
                    searchParams.set('sale', 'true');
                  }
                  setSearchParams(searchParams);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all border-2 flex items-center justify-between ${
                  onSale 
                    ? 'bg-[#1E90FF] border-[#1E90FF] text-white font-bold' 
                    : 'border-transparent text-gray-600 hover:bg-white hover:text-[#1E90FF] hover:border-[#1E90FF]'
                }`}
              >
                <span>Sale Items</span>
                {onSale && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              </button>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Price Range</h3>
              <div className="px-2 space-y-4">
                <input type="range" className="w-full accent-primary" min="0" max="10000" />
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>KES 0</span>
                  <span>KES 10,000+</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-primary mb-2">Nationwide Shipping</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                We deliver to all major towns in Kenya within 24-48 hours. Shop with confidence.
              </p>
              <Link to="/shipping" className="text-primary text-xs font-bold hover:underline">Shipping info &rarr;</Link>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-300">Synchronizing Catalog</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        opacity: { duration: 0.4 },
                        layout: { duration: 0.5, type: "spring", stiffness: 100, damping: 20 },
                        delay: Math.min(idx * 0.05, 0.5) 
                      }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                  <X size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  We couldn't find any items matching your current filters. Try adjusting your search or category.
                </p>
                <button 
                  onClick={() => {
                    setSearchParams({});
                  }}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

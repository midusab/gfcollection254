import React from 'react';
import { Product } from '../types';
import { useCartStore } from '../store';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white overflow-hidden rounded-none luxury-shadow flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-primary text-white text-[8px] font-bold px-3 py-1 uppercase tracking-widest">
            New
          </span>
        )}
        {product.onSale && (
          <span className="bg-[#1E90FF] text-white text-[8px] font-bold px-3 py-1 uppercase tracking-widest">
            -{discount}%
          </span>
        )}
      </div>

      {/* Wishlist Icon */}
      <button className="absolute top-4 right-4 z-20 p-2 text-primary hover:text-gold transition-colors">
        <Heart size={18} className="stroke-[1.5]" />
      </button>

      {/* Image Area */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button className="bg-white text-primary p-3 rounded-full hover:bg-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
            <Eye size={20} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="bg-white text-primary p-3 rounded-full hover:bg-gold hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 duration-300"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 bg-white border-t border-beige">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-gold text-gold" />
            <span className="text-[10px] font-bold text-gray-400">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`} className="block group/link">
          <h3 className="text-sm font-display font-medium text-primary mb-3 leading-tight group-hover/link:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2 font-display">
            <span className="text-lg font-bold text-primary">KES {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">KES {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button 
            onClick={() => addItem(product)}
            className="text-[10px] items-center gap-1 font-bold uppercase tracking-widest text-primary flex hover:text-gold transition-colors"
          >
            Add to Cart +
          </button>
        </div>
      </div>
    </motion.div>
  );
}

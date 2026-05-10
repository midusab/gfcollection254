import { create } from 'zustand';
import { CartItem, Product } from './types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

// Simple custom implementation of a store if zustand is not available
// But I should probably install zustand for a better experience, or use Context.
// I'll install zustand just to be safe and clean.
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i),
        total: state.total + product.price
      };
    }
    return {
      items: [...state.items, { ...product, quantity: 1 }],
      total: state.total + product.price
    };
  }),
  removeItem: (productId) => set((state) => {
    const item = state.items.find(i => i.id === productId);
    return {
      items: state.items.filter(i => i.id !== productId),
      total: state.total - (item ? item.price * item.quantity : 0)
    };
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    const items = state.items.map(i => i.id === productId ? { ...i, quantity } : i);
    const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    return { items, total };
  }),
  clearCart: () => set({ items: [], total: 0 }),
  total: 0,
}));

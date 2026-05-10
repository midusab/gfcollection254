export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'Clothing' | 'Accessories' | 'Shoes' | 'Bags';
  image: string;
  description: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  onSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

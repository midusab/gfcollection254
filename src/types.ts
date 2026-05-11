export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
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
  rating?: number;
  reviews?: number;
  isNew?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

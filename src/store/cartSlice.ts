import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  title: string;
  thumbnail?: string;
  handle?: string;
  price?: number | { amount: number };
  variants?: any[];
}

interface VariantOption {
  name: string;
  value: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    id: string;
    title: string;
    options: Record<string, string>;
    price?: number | { amount: number };
  };
}

export interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const getPriceAmount = (price: number | { amount: number } | undefined): number => {
  if (!price) return 0;
  if (typeof price === 'object') return price.amount;
  return price;
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.variant?.price ? getPriceAmount(item.variant.price) : getPriceAmount(item.product.price);
    return sum + price * item.quantity;
  }, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadState: (state, action: PayloadAction<CartState>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number; variant?: CartItem['variant'] }>) => {
      const { product, quantity, variant } = action.payload;
      const existingItem = state.items.find(item => 
        item.product.id === product.id && 
        JSON.stringify(item.variant?.options) === JSON.stringify(variant?.options)
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, variant });
      }
      state.total = calculateTotal(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product.id !== action.payload);
      state.total = calculateTotal(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
      state.total = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { loadState: loadCartState, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

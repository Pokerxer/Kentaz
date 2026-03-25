import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartProduct {
  id: string;
  title: string;
  handle?: string;
  thumbnail?: string;
  images?: { url: string }[];
  price?: number;
  variants?: { size?: string; color?: string; price: number }[];
}

interface CartItem {
  product: CartProduct;
  quantity: number;
  variant?: {
    id?: string;
    title?: string;
    options?: Record<string, string>;
    size?: string;
    color?: string;
    price?: number;
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

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = item.variant?.price || (typeof item.product.price === 'number' ? item.product.price : 0);
    return sum + (price || 0) * item.quantity;
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
    addToCart: (state, action: PayloadAction<{ product: CartProduct; quantity: number; variant?: CartItem['variant'] }>) => {
      const { product, quantity, variant } = action.payload;
      const existingItem = state.items.find(item => 
        item.product.id === product.id && 
        item.variant?.size === variant?.size && 
        item.variant?.color === variant?.color
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
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number; variant?: CartItem['variant'] }>) => {
      const { productId, quantity, variant } = action.payload;
      const item = state.items.find(item => 
        item.product.id === productId && 
        item.variant?.size === variant?.size && 
        item.variant?.color === variant?.color
      );
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

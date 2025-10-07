import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ProductDto } from '../api/products';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

const CART_KEY = 'cartItems';

const loadInitialState = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch (error) {
    console.error('Failed to parse cart state', error);
    return [];
  }
};

const persistState = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadInitialState());

  const totalCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );
  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.quantity * item.product.price, 0),
  );

  const addToCart = (product: ProductDto) => {
    const existing = items.value.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({ product, quantity: 1 });
    }
    persistState(items.value);
  };

  const removeFromCart = (productId: number) => {
    items.value = items.value.filter((item) => item.product.id !== productId);
    persistState(items.value);
  };

  const changeQuantity = (productId: number, quantity: number) => {
    const target = items.value.find((item) => item.product.id === productId);
    if (!target) {
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    target.quantity = quantity;
    persistState(items.value);
  };

  const clearCart = () => {
    items.value = [];
    persistState(items.value);
  };

  return {
    items,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    changeQuantity,
    clearCart,
  };
});

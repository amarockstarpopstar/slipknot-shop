import { defineStore, storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  addCartItem,
  checkoutCart,
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemDto,
  type CartResponse,
  type CheckoutResponse,
} from '../api/cart';
import { extractErrorMessage } from '../api/http';
import { useAuthStore } from './authStore';
import { router } from '../router';
import { isAxiosError } from 'axios';

export const CART_AUTH_MESSAGE = 'Авторизуйтесь, чтобы добавить товар в корзину';

// store managing cart state via backend api
export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  const cartId = ref<number | null>(null);
  const items = ref<CartItemDto[]>([]);
  const totalQuantity = ref(0);
  const totalAmount = ref(0);
  const loading = ref(false);
  const updating = ref(false);
  const error = ref<string | null>(null);
  const lastOrder = ref<CheckoutResponse | null>(null);

  const isEmpty = computed(() => totalQuantity.value === 0);

  const setCartState = (cart: CartResponse) => {
    cartId.value = cart.id;
    items.value = cart.items;
    totalQuantity.value = cart.totalQuantity;
    totalAmount.value = cart.totalAmount;
  };

  const resetCart = () => {
    cartId.value = null;
    items.value = [];
    totalQuantity.value = 0;
    totalAmount.value = 0;
  };

  const ensureAuthenticated = (): boolean => {
    if (!isAuthenticated.value) {
      router.push({ path: '/login', query: { message: CART_AUTH_MESSAGE } });
      return false;
    }
    return true;
  };

  const handleUnauthorized = () => {
    authStore.logout();
    resetCart();
    lastOrder.value = null;
    error.value = null;
    router.push({ path: '/login', query: { message: CART_AUTH_MESSAGE } });
  };

  const withUpdate = async <T>(action: () => Promise<T>): Promise<T | null> => {
    updating.value = true;
    try {
      const result = await action();
      error.value = null;
      return result;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        handleUnauthorized();
        return null;
      }
      error.value = extractErrorMessage(err);
      console.error('Cart action failed', err);
      return null;
    } finally {
      updating.value = false;
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated.value) {
      resetCart();
      return;
    }

    loading.value = true;
    try {
      const cart = await fetchCart();
      setCartState(cart);
      error.value = null;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        handleUnauthorized();
      } else {
        error.value = extractErrorMessage(err);
        console.error('Failed to load cart', err);
      }
    } finally {
      loading.value = false;
    }
  };

  const addProduct = async (productId: number, quantity = 1) => {
    if (!ensureAuthenticated()) {
      return;
    }
    const cart = await withUpdate(() => addCartItem({ productId, quantity }));
    if (cart) {
      setCartState(cart);
    }
  };

  const changeItemQuantity = async (itemId: number, quantity: number) => {
    if (!ensureAuthenticated()) {
      return;
    }
    const cart = await withUpdate(() => updateCartItemQuantity(itemId, { quantity }));
    if (cart) {
      setCartState(cart);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!ensureAuthenticated()) {
      return;
    }
    const cart = await withUpdate(() => removeCartItem(itemId));
    if (cart) {
      setCartState(cart);
    }
  };

  const checkout = async (): Promise<CheckoutResponse | null> => {
    if (!ensureAuthenticated()) {
      return null;
    }
    const result = await withUpdate(() => checkoutCart());
    if (result) {
      lastOrder.value = result;
      resetCart();
    }
    return result;
  };

  const payOrder = async (): Promise<CheckoutResponse | null> => {
    return checkout();
  };

  watch(
    isAuthenticated,
    (loggedIn) => {
      if (loggedIn) {
        void loadCart();
        return;
      }
      resetCart();
      lastOrder.value = null;
    },
    { immediate: true }
  );

  return {
    cartId,
    items,
    totalQuantity,
    totalAmount,
    isEmpty,
    loading,
    updating,
    error,
    lastOrder,
    loadCart,
    addProduct,
    changeItemQuantity,
    removeItem,
    checkout,
    payOrder,
  };
});

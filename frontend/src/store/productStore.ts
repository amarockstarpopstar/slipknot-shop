import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductDto } from '../api/products';
import { fetchProducts, fetchProductById } from '../api/products';
import { extractErrorMessage } from '../api/http';

export const useProductStore = defineStore('products', () => {
  const items = ref<ProductDto[]>([]);
  const selected = ref<ProductDto | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadAll = async (): Promise<ProductDto[] | null> => {
    try {
      loading.value = true;
      items.value = await fetchProducts();
      error.value = null;
      return items.value;
    } catch (err) {
      error.value = extractErrorMessage(err);
      console.error('Failed to load products', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadOne = async (id: number): Promise<ProductDto | null> => {
    try {
      loading.value = true;
      selected.value = await fetchProductById(id);
      error.value = null;
      return selected.value;
    } catch (err) {
      error.value = extractErrorMessage(err);
      selected.value = null;
      console.error('Failed to load product', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    items,
    selected,
    loading,
    error,
    loadAll,
    loadOne,
  };
});

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

  const loadAll = async () => {
    try {
      loading.value = true;
      items.value = await fetchProducts();
      error.value = null;
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadOne = async (id: number) => {
    try {
      loading.value = true;
      selected.value = await fetchProductById(id);
      error.value = null;
    } catch (err) {
      error.value = extractErrorMessage(err);
      throw err;
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

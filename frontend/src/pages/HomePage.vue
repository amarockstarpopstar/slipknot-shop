<template>
  <div class="home-page">
    <section class="hero-section fade-in-up">
      <div class="layout-container text-center">
        <span class="chip mb-3">Официальный мерч</span>
        <h1 class="section-title mb-3">Каталог Slipknot</h1>
        <p class="section-subtitle mb-0">
          Выбирайте фирменные футболки, худи и коллекционные аксессуары из свежей коллекции. Всё — с гарантией подлинности.
        </p>
      </div>
    </section>
    <section class="section fade-in-up" data-delay="1">
      <div class="layout-container">
        <div
          v-if="infoMessage"
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {{ infoMessage }}
          <button type="button" class="btn-close" aria-label="Закрыть" @click="dismissInfoMessage"></button>
        </div>
        <div class="section-header">
          <div class="section-header__title-block">
            <h2 class="section-header__title">Популярные товары</h2>
            <p class="section-header__subtitle">Мини-поиск помогает быстро отыскать нужный артикул или название.</p>
          </div>
          <div class="section-header__controls">
            <div class="product-search" :class="{ 'product-search--active': hasActiveSearch }">
              <span class="product-search__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input
                v-model="searchTerm"
                type="search"
                class="product-search__input"
                placeholder="Искать по артикулу или названию"
                aria-label="Поиск товаров по артикулу или названию"
                :disabled="loading"
              />
              <button
                v-if="hasActiveSearch"
                type="button"
                class="product-search__clear"
                aria-label="Очистить поиск"
                @click="clearSearch"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="loading">
              Обновить список
            </button>
          </div>
        </div>
        <LoadingSpinner v-if="loading" />
        <div v-else>
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-else-if="filteredProducts.length" class="products-grid">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product">
              <template #actions>
                <button
                  class="btn btn-danger btn-sm"
                  :disabled="isProductBeingAdded(product.id) || cartUpdating"
                  @click="addToCart(product)"
                >
                  <span
                    v-if="isProductBeingAdded(product.id)"
                    class="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  В корзину
                </button>
                <RouterLink class="btn btn-outline-light btn-sm" :to="`/product/${product.id}`">
                  Подробнее
                </RouterLink>
              </template>
            </ProductCard>
          </div>
          <div v-else-if="products.length" class="alert alert-secondary mt-4" role="alert">
            По вашему запросу ничего не найдено. Попробуйте изменить формулировку или ввести другой артикул.
          </div>
          <div v-else class="alert alert-info mt-4" role="alert">
            Товары скоро появятся, следите за обновлениями.
          </div>
        </div>
      </div>
    </section>
    <ProductSizeModal
      :visible="showSizeModal"
      :product="selectedProduct"
      :disabled="cartUpdating"
      @select="handleSizeSelect"
      @close="closeSizeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, type LocationQuery } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ProductCard from '../components/ProductCard.vue';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useNavigation } from '../composables/useNavigation';
import ProductSizeModal from '../components/ProductSizeModal.vue';

import type { ProductDto, ProductSizeDto } from '../api/products';

const productStore = useProductStore();
const cartStore = useCartStore();
const route = useRoute();
const { safeReplace } = useNavigation();

const { items: products, loading, error } = storeToRefs(productStore);
const { updating: cartUpdatingRef } = storeToRefs(cartStore);

const selectedProduct = ref<ProductDto | null>(null);
const showSizeModal = ref(false);
const pendingProductId = ref<number | null>(null);
const initialSearchParam = route.query.search;
const initialSearchValue = Array.isArray(initialSearchParam)
  ? initialSearchParam[0] ?? ''
  : typeof initialSearchParam === 'string'
  ? initialSearchParam
  : '';

const searchTerm = ref(initialSearchValue);

let lastLoadedSearch: string | null = null;

const executeSearch = async (query: string, force = false) => {
  const normalized = query.trim();

  if (!force && lastLoadedSearch !== null && normalized === lastLoadedSearch) {
    return null;
  }

  const result = await productStore.loadAll(normalized ? normalized : undefined);

  if (result !== null || force) {
    lastLoadedSearch = normalized;
  }

  return result;
};

const refreshProducts = async () => {
  await executeSearch(searchTerm.value, true);
};

const resolveDefaultSizeId = (sizes: ProductSizeDto[]): number | null => {
  if (!sizes.length) {
    return null;
  }
  const inStock = sizes.find((size) => size.stock > 0);
  return (inStock ?? sizes[0]).id;
};

const addProductToCart = async (product: ProductDto, sizeId: number | null) => {
  pendingProductId.value = product.id;
  try {
    await cartStore.addProduct(product.id, 1, sizeId);
  } finally {
    pendingProductId.value = null;
  }
};

const addToCart = (product: (typeof products.value)[number]) => {
  if (product.sizes && product.sizes.length > 1) {
    selectedProduct.value = product;
    showSizeModal.value = true;
    return;
  }

  const sizeId = product.sizes ? resolveDefaultSizeId(product.sizes) : null;
  void addProductToCart(product, sizeId);
};

const closeSizeModal = () => {
  if (cartUpdatingRef.value) {
    return;
  }
  showSizeModal.value = false;
  selectedProduct.value = null;
};

const handleSizeSelect = async (sizeId: number) => {
  if (!selectedProduct.value) {
    return;
  }
  await addProductToCart(selectedProduct.value, sizeId);
  closeSizeModal();
};

const cartUpdating = computed(() => cartUpdatingRef.value);

const isProductBeingAdded = (productId: number) => pendingProductId.value === productId;

const infoMessage = computed(() => {
  const message = route.query.message;
  return typeof message === 'string' ? message : '';
});

const dismissInfoMessage = () => {
  if (!infoMessage.value) {
    return;
  }
  const nextQuery: LocationQuery = { ...route.query };
  delete nextQuery.message;
  void safeReplace({ query: nextQuery });
};

const filteredProducts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();
  if (!query) {
    return products.value;
  }

  return products.value.filter((product) => {
    const title = product.title?.toLowerCase() ?? '';
    const sku = product.sku?.toLowerCase() ?? '';
    return title.includes(query) || sku.includes(query);
  });
});

const hasActiveSearch = computed(() => searchTerm.value.trim().length > 0);

const clearSearch = () => {
  if (!hasActiveSearch.value) {
    return;
  }
  searchTerm.value = '';
};

watch(
  searchTerm,
  (value, _oldValue, onCleanup) => {
    const normalized = value.trim();

    if (lastLoadedSearch !== null && normalized === lastLoadedSearch) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void executeSearch(normalized);
    }, 300);

    onCleanup(() => {
      clearTimeout(timeoutId);
    });
  },
  { immediate: true },
);
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3.5rem);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-header__title-block {
  max-width: 420px;
}

.section-header__title {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 600;
  margin: 0;
}

.section-header__subtitle {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
}

.section-header__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-search {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.35rem 0.75rem 0.35rem 2.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.product-search--active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.product-search__icon {
  position: absolute;
  left: 0.85rem;
  display: inline-flex;
  width: 1.1rem;
  height: 1.1rem;
  color: rgba(255, 255, 255, 0.6);
}

.product-search__input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.95rem;
  min-width: 220px;
  outline: none;
}

.product-search__input::-webkit-search-decoration,
.product-search__input::-webkit-search-cancel-button,
.product-search__input::-webkit-search-results-button,
.product-search__input::-webkit-search-results-decoration {
  display: none;
}

.product-search__input::-ms-clear,
.product-search__input::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}

.product-search__input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.product-search__input:disabled {
  color: rgba(255, 255, 255, 0.45);
}

.product-search__clear {
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.product-search__clear:hover {
  background: rgba(255, 255, 255, 0.24);
}

.product-search__clear span {
  font-size: 1.1rem;
  line-height: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: clamp(1.25rem, 2.5vw, 2rem);
}

@media (max-width: 575.98px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-header :deep(.btn) {
    width: 100%;
  }

  .section-header__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .product-search {
    width: 100%;
  }

  .product-search__input {
    width: 100%;
  }
}
</style>

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
          <h2 class="section-header__title">Популярные товары</h2>
          <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="loading">
            Обновить список
          </button>
        </div>
        <LoadingSpinner v-if="loading" />
        <div v-else>
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <div v-else class="products-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product">
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
          <div v-if="!products.length && !error" class="alert alert-info mt-4" role="alert">
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
import { computed, onMounted, ref } from 'vue';
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

const refreshProducts = async () => {
  await productStore.loadAll();
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

onMounted(async () => {
  if (!products.value.length) {
    await productStore.loadAll();
  }
});
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

.section-header__title {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 600;
  margin: 0;
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
}
</style>

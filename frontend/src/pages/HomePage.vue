<template>
  <section class="py-5 bg-dark text-white text-center">
    <div class="container">
      <h1 class="display-4 fw-bold mb-3">Каталог мерча Slipknot</h1>
      <p class="lead mb-0">
        Выбирайте фирменные футболки, худи и коллекционные аксессуары из официальной коллекции
      </p>
    </div>
  </section>
  <section class="py-5">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h4 mb-0">Популярные товары</h2>
        <button class="btn btn-outline-secondary" @click="refreshProducts" :disabled="loading">
          Обновить список
        </button>
      </div>
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div v-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <div v-else class="row g-4">
          <div v-for="product in products" :key="product.id" class="col-sm-6 col-lg-4">
            <ProductCard :product="product">
              <template #actions>
                <button class="btn btn-danger btn-sm" @click="addToCart(product)">
                  В корзину
                </button>
                <RouterLink class="btn btn-outline-dark btn-sm ms-2" :to="`/product/${product.id}`">
                  Подробнее
                </RouterLink>
              </template>
            </ProductCard>
          </div>
        </div>
        <div v-if="!products.length && !error" class="alert alert-info mt-4" role="alert">
          Товары скоро появятся, следите за обновлениями.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ProductCard from '../components/ProductCard.vue';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

const productStore = useProductStore();
const cartStore = useCartStore();

const { items: products, loading, error } = storeToRefs(productStore);

const refreshProducts = async () => {
  await productStore.loadAll();
};

const addToCart = (product: (typeof products.value)[number]) => {
  cartStore.addProduct(product.id);
};

onMounted(async () => {
  if (!products.value.length) {
    await productStore.loadAll();
  }
});
</script>

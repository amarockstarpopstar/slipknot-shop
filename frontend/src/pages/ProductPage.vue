<template>
  <section class="py-5">
    <div class="container">
      <RouterLink to="/" class="btn btn-link text-decoration-none mb-4">
        ← Назад к каталогу
      </RouterLink>
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div v-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>
        <div v-else-if="product" class="row g-4 align-items-center">
          <div class="col-md-6">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              class="img-fluid rounded shadow-sm"
              :alt="`Изображение ${product.title}`"
            />
            <div v-else class="bg-light border rounded p-5 text-center text-muted">
              Фото появится позже
            </div>
          </div>
          <div class="col-md-6">
            <h1 class="display-6 fw-bold mb-3">{{ product.title }}</h1>
            <p class="text-muted mb-2">Категория: {{ product.category?.name ?? 'не указана' }}</p>
            <p class="mb-4">{{ product.description ?? 'Описание будет добавлено позже.' }}</p>
            <p class="mb-2">Артикул: {{ product.sku }}</p>
            <p class="mb-4">
              Размер: {{ product.size?.name ?? 'универсальный' }} · Остаток: {{ product.stockCount }} шт.
            </p>
            <div class="d-flex align-items-center mb-4">
              <span class="display-6 text-danger me-3">{{ product.price.toLocaleString('ru-RU') }} ₽</span>
              <button class="btn btn-danger btn-lg" @click="addToCart(product)">
                Добавить в корзину
              </button>
            </div>
            <div class="alert alert-dark" role="alert">
              Бесплатная доставка по России при заказе от 7 000 ₽
            </div>
          </div>
        </div>
        <div v-else class="alert alert-info" role="alert">
          Товар не найден или был удалён.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();

const { selected: product, loading, error } = storeToRefs(productStore);

const loadProduct = async (id: number) => {
  await productStore.loadOne(id);
};

const addToCart = (item: NonNullable<typeof product.value>) => {
  cartStore.addProduct(item.id);
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (Number.isFinite(id)) {
    await loadProduct(id);
  }
});

watch(
  () => route.params.id,
  async (value) => {
    const id = Number(value);
    if (Number.isFinite(id)) {
      await loadProduct(id);
    }
  },
);
</script>

<template>
  <section class="py-5">
    <div class="container">
      <RouterLink to="/" class="btn btn-link text-decoration-none mb-4">
        ← Назад к каталогу
      </RouterLink>
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div v-if="productError" class="alert alert-danger" role="alert">
          {{ productError }}
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
            <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
              <span class="display-6 text-danger me-3">{{ product.price.toLocaleString('ru-RU') }} ₽</span>
              <button class="btn btn-danger btn-lg" type="button" @click="openConfirm">
                Оформить
              </button>
              <button class="btn btn-outline-light btn-lg" type="button" @click="addToCart(product)">
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
    <Teleport to="body">
      <div
        v-if="showConfirm"
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        @click.self="closeConfirm"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-white border border-light">
            <header class="modal-header border-secondary">
              <h2 class="modal-title h4 mb-0">Подтвердите оформление</h2>
              <button
                type="button"
                class="btn-close btn-close-white"
                aria-label="Закрыть"
                @click="closeConfirm"
              ></button>
            </header>
            <section class="modal-body">
              <p class="mb-3">
                Вы собираетесь оформить заказ на товар «{{ product?.title }}» стоимостью
                {{ product ? product.price.toLocaleString('ru-RU') : '' }} ₽.
              </p>
              <p class="mb-4 text-muted">
                После подтверждения товар будет добавлен в корзину, и вы перейдёте к оплате.
              </p>
              <p v-if="confirmError" class="alert alert-danger mb-0">{{ confirmError }}</p>
            </section>
            <footer class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-light" @click="closeConfirm" :disabled="confirmLoading">
                Отмена
              </button>
              <button type="button" class="btn btn-danger" @click="confirmPurchase" :disabled="confirmLoading">
                <span
                  v-if="confirmLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Перейти к оплате
              </button>
            </footer>
          </div>
        </div>
      </div>
      <div v-if="showConfirm" class="modal-backdrop fade show"></div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

const { selected: product, loading, error: productError } = storeToRefs(productStore);
const { error: cartError } = storeToRefs(cartStore);
const { isAuthenticated } = storeToRefs(authStore);

const showConfirm = ref(false);
const confirmLoading = ref(false);
const confirmError = ref<string | null>(null);

const loadProduct = async (id: number) => {
  await productStore.loadOne(id);
};

const addToCart = async (item: NonNullable<typeof product.value>) => {
  await cartStore.addProduct(item.id);
};

const openConfirm = () => {
  if (!product.value) {
    return;
  }
  if (!isAuthenticated.value) {
    void router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  confirmError.value = null;
  cartError.value = null;
  showConfirm.value = true;
};

const closeConfirm = () => {
  if (confirmLoading.value) {
    return;
  }
  showConfirm.value = false;
};

const confirmPurchase = async () => {
  if (!product.value) {
    return;
  }
  confirmLoading.value = true;
  confirmError.value = null;
  cartError.value = null;
  await cartStore.addProduct(product.value.id);
  if (cartError.value) {
    confirmError.value = cartError.value;
    confirmLoading.value = false;
    return;
  }
  confirmLoading.value = false;
  showConfirm.value = false;
  await router.push({ name: 'checkout-payment' });
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

watch(cartError, (value) => {
  if (value && showConfirm.value && !confirmLoading.value) {
    confirmError.value = value;
  }
});
</script>

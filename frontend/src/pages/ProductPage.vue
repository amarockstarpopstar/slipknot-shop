<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <RouterLink to="/" class="accent-link d-inline-flex align-items-center mb-4">
        ← Назад к каталогу
      </RouterLink>
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div v-if="productError" class="alert alert-danger" role="alert">
          {{ productError }}
        </div>
        <div v-else-if="product" class="product-layout">
          <div class="product-gallery">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              class="product-gallery__image"
              :alt="`Изображение ${product.title}`"
            />
            <div v-else class="product-gallery__placeholder">Фото появится позже</div>
          </div>
          <div class="product-details">
            <h1 class="product-details__title">{{ product.title }}</h1>
            <p class="product-details__category">Категория: {{ product.category?.name ?? 'не указана' }}</p>
            <p class="product-details__description">{{ product.description ?? 'Описание будет добавлено позже.' }}</p>
            <div class="product-details__meta">
              <span>Артикул: {{ product.sku }}</span>
              <span>Размер: {{ product.size?.name ?? 'универсальный' }}</span>
              <span>Остаток: {{ product.stockCount }} шт.</span>
            </div>
            <div class="product-details__actions">
              <span class="product-details__price">{{ product.price.toLocaleString('ru-RU') }} ₽</span>
              <div class="product-details__buttons">
                <button class="btn btn-danger btn-lg" type="button" @click="openConfirm">
                  Оформить
                </button>
                <button class="btn btn-outline-light btn-lg" type="button" @click="addToCart(product)">
                  Добавить в корзину
                </button>
              </div>
            </div>
            <div class="product-details__info">
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
        class="modal fade show d-block glass-modal"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        @click.self="closeConfirm"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <header class="modal-header">
              <h2 class="modal-title h4 mb-0">Подтвердите оформление</h2>
              <button
                type="button"
                class="btn-close"
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
            <footer class="modal-footer">
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

<style scoped>
.product-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 3.5rem);
  align-items: start;
}

.product-gallery {
  position: sticky;
  top: 120px;
}

.product-gallery__image {
  width: 100%;
  border-radius: calc(var(--radius-lg) * 1.2);
  box-shadow: var(--shadow-card);
}

.product-gallery__placeholder {
  display: grid;
  place-items: center;
  border-radius: calc(var(--radius-lg) * 1.2);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
  color: var(--color-text-muted);
  padding: 4rem 2rem;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2rem);
  border-radius: calc(var(--radius-lg) * 1.2);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
}

.product-details__title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 700;
}

.product-details__category {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.product-details__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.product-details__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.product-details__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.product-details__price {
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 700;
  color: color-mix(in srgb, var(--color-danger) 60%, var(--color-text));
}

.product-details__buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.product-details__info {
  padding: 1rem 1.2rem;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  font-size: 0.95rem;
  color: var(--color-text);
}

@media (max-width: 991.98px) {
  .product-layout {
    grid-template-columns: 1fr;
  }

  .product-gallery {
    position: static;
  }
}

@media (max-width: 575.98px) {
  .product-details__buttons {
    flex-direction: column;
  }

  .product-details__buttons :deep(.btn) {
    width: 100%;
  }
}
</style>

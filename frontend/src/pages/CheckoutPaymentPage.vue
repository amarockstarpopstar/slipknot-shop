<template>
  <section class="py-5 bg-dark text-white min-vh-100">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Оплата заказа</h1>

      <LoadingSpinner v-if="loading && !hasItems && !paymentSuccess" />

      <div v-else>
        <div v-if="paymentSuccess" class="mb-5">
          <div class="alert alert-success" role="alert">
            Заказ №{{ lastOrder?.orderId }} успешно оплачен. Сумма: {{ formatCurrency(lastOrder?.totalAmount ?? 0) }}
          </div>
          <div class="card bg-secondary border-0 text-white shadow-lg">
            <div class="card-body">
              <h2 class="h4 mb-3">Статус отправки</h2>
              <p class="mb-1 fw-semibold">{{ lastOrder?.shippingStatus }}</p>
              <p class="mb-3 text-muted small">Обновлено: {{ formatDate(lastOrder?.shippingUpdatedAt ?? '') }}</p>
              <RouterLink class="btn btn-outline-light me-2" to="/orders">Перейти к истории заказов</RouterLink>
              <RouterLink class="btn btn-light" to="/">Продолжить покупки</RouterLink>
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="!items.length" class="alert alert-info" role="alert">
            Корзина пуста. Добавьте товары, чтобы оформить заказ.
          </div>
          <div v-else class="row g-4">
            <div class="col-lg-8">
              <div class="list-group shadow-lg">
                <article
                  v-for="item in items"
                  :key="item.id"
                  class="list-group-item bg-dark text-white border-secondary d-flex gap-3 align-items-center"
                >
                  <img
                    v-if="item.product.imageUrl"
                    :src="item.product.imageUrl"
                    class="rounded"
                    width="96"
                    height="96"
                    :alt="item.product.title"
                  />
                  <div class="flex-grow-1">
                    <h2 class="h5 mb-2">{{ item.product.title }}</h2>
                    <p class="mb-1 text-muted">Цена: {{ formatCurrency(item.product.price) }}</p>
                    <p class="mb-0 text-muted">Количество: {{ item.quantity }}</p>
                  </div>
                </article>
              </div>
            </div>
            <div class="col-lg-4">
              <aside class="card shadow-lg bg-secondary text-white border-0">
                <div class="card-body">
                  <h2 class="h4 mb-3">К оплате</h2>
                  <p class="mb-1">Товаров: {{ totalQuantity }}</p>
                  <p class="mb-3">Сумма: {{ formatCurrency(totalAmount) }}</p>
                  <button
                    type="button"
                    class="btn btn-danger w-100"
                    @click="payOrder"
                    :disabled="updating || !items.length"
                  >
                    Оплатить
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <p v-if="localError" class="alert alert-danger mt-4 mb-0">{{ localError }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();
const { items, totalAmount, totalQuantity, loading, updating, error, lastOrder } = storeToRefs(cartStore);

const localError = ref<string | null>(null);

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatDate = (value: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleString('ru-RU');
};

const hasItems = computed(() => items.value.length > 0);

const paymentSuccess = computed(() => Boolean(lastOrder.value));

const payOrder = async () => {
  const result = await cartStore.checkout();
  if (!result) {
    localError.value = error.value ?? 'Не удалось оформить заказ. Попробуйте ещё раз.';
  } else {
    localError.value = null;
  }
};

onMounted(() => {
  localError.value = error.value;
  if (!items.value.length) {
    void cartStore.loadCart();
  }
});

watch(error, (value) => {
  localError.value = value ?? null;
});
</script>

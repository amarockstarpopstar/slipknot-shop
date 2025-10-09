<template>
  <section class="py-5 bg-dark text-white min-vh-100">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Корзина</h1>

      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <div v-else>
        <div v-if="isEmpty" class="alert alert-info" role="alert">
          Корзина пуста. Добавьте товары из каталога, чтобы оформить заказ.
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
                  class="rounded" width="96" height="96"
                  :alt="item.product.title"
                />
                <div class="flex-grow-1">
                  <h2 class="h5 mb-2">{{ item.product.title }}</h2>
                  <p class="mb-2 text-muted">Цена: {{ formatCurrency(item.product.price) }}</p>
                  <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="me-2">Количество:</span>
                    <div class="btn-group" role="group" aria-label="Управление количеством">
                      <button
                        type="button"
                        class="btn btn-outline-light"
                        @click="decrease(item)"
                        :disabled="updating"
                      >
                        –
                      </button>
                      <span class="btn btn-outline-light disabled">{{ item.quantity }}</span>
                      <button
                        type="button"
                        class="btn btn-outline-light"
                        @click="increase(item)"
                        :disabled="updating"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn btn-outline-danger ms-auto"
                      @click="remove(item)"
                      :disabled="updating"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div class="col-lg-4">
            <aside class="card shadow-lg bg-secondary text-white border-0">
              <div class="card-body">
                <h2 class="h4 mb-3">Итог по заказу</h2>
                <p class="mb-1">Товаров: {{ totalQuantity }}</p>
                <p class="mb-3">Сумма: {{ formatCurrency(totalAmount) }}</p>
                <button
                  type="button"
                  class="btn btn-danger w-100 mb-2"
                  @click="goToPayment"
                  :disabled="updating || isEmpty"
                >
                  Перейти к оплате
                </button>
                <p v-if="errorMessage" class="alert alert-danger small mb-0">{{ errorMessage }}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../store/cartStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const { items, totalAmount, totalQuantity, isEmpty, loading, updating, error } = storeToRefs(cartStore);
const errorMessage = ref('');
const router = useRouter();

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const increase = (item: (typeof items.value)[number]) => {
  cartStore.changeItemQuantity(item.id, item.quantity + 1);
};

const decrease = (item: (typeof items.value)[number]) => {
  if (item.quantity <= 1) {
    cartStore.removeItem(item.id);
    return;
  }
  cartStore.changeItemQuantity(item.id, item.quantity - 1);
};

const remove = (item: (typeof items.value)[number]) => {
  cartStore.removeItem(item.id);
};

const goToPayment = () => {
  void router.push({ name: 'checkout-payment' });
};

watch(error, (value) => {
  errorMessage.value = value ?? '';
});

onMounted(() => {
  void cartStore.loadCart();
});
</script>

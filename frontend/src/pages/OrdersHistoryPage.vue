<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <div class="orders-header">
        <div>
          <span class="chip mb-2">История</span>
          <h1 class="section-title">Мои заказы</h1>
          <p class="section-subtitle mb-0">Отслеживайте историю покупок и статусы отправки.</p>
        </div>
        <button class="btn btn-outline-secondary" type="button" @click="loadOrders" :disabled="loading">
          Обновить список
        </button>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else>
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
        <div v-else-if="!orders.length" class="alert alert-info" role="alert">
          Заказов пока нет. Добавьте товары в корзину и оформите заказ.
        </div>
        <div v-else class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">№ заказа</th>
                <th scope="col">Дата оформления</th>
                <th scope="col">Сумма</th>
                <th scope="col">Статус оплаты</th>
                <th scope="col">Статус отправки</th>
                <th scope="col">Обновлено</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <th scope="row">{{ order.id }}</th>
                <td>{{ formatDate(order.placedAt) }}</td>
                <td>{{ formatCurrency(order.totalAmount) }}</td>
                <td><span class="status-chip">{{ order.status.name }}</span></td>
                <td>{{ order.shippingStatus }}</td>
                <td>{{ formatDate(order.shippingUpdatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { fetchCustomerOrders, type CustomerOrderDto } from '../api/customerOrders';
import { extractErrorMessage } from '../api/http';

const orders = ref<CustomerOrderDto[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString('ru-RU');
};

const loadOrders = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    orders.value = await fetchCustomerOrders();
  } catch (error) {
    errorMessage.value = extractErrorMessage(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadOrders();
});
</script>

<style scoped>
.orders-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 25%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 575.98px) {
  .orders-header :deep(.btn) {
    width: 100%;
  }
}
</style>

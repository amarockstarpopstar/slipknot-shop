<template>
  <section class="py-5 bg-dark text-white min-vh-100">
    <div class="container">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between mb-4 gap-3">
        <div>
          <h1 class="display-6 fw-bold mb-1">Мои заказы</h1>
          <p class="mb-0 text-muted">Отслеживайте историю покупок и статусы отправки.</p>
        </div>
        <button class="btn btn-outline-light" type="button" @click="loadOrders" :disabled="loading">
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
          <table class="table table-dark table-striped align-middle">
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
                <td>{{ order.status.name }}</td>
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

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
        <div v-else class="orders-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <header class="order-card__header">
              <div>
                <span class="order-card__number">Заказ №{{ order.id }}</span>
                <p class="order-card__date">Оформлен {{ formatDate(order.placedAt) }}</p>
              </div>
              <div class="order-card__chips">
                <span class="status-chip">{{ order.status.name }}</span>
                <span class="order-card__chip-muted">{{ order.shippingStatus }}</span>
              </div>
            </header>

            <div class="order-card__summary">
              <div class="summary-item">
                <span class="summary-item__label">Оплата</span>
                <span class="summary-item__value">{{ order.paymentMethod ?? 'Не указано' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-item__label">Товары</span>
                <span class="summary-item__value">
                  {{ getTotalQuantity(order) }} шт · {{ formatCurrency(order.totalAmount) }}
                </span>
              </div>
              <div class="summary-item">
                <span class="summary-item__label">Обновлено</span>
                <span class="summary-item__value">{{ formatDate(order.shippingUpdatedAt) }}</span>
              </div>
            </div>

            <div class="order-card__actions">
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                @click="toggleOrder(order.id)"
                :aria-expanded="isExpanded(order.id)"
              >
                {{ isExpanded(order.id) ? 'Скрыть состав заказа' : 'Показать состав заказа' }}
              </button>
            </div>

            <transition name="fade">
              <div v-if="isExpanded(order.id)" class="order-card__items">
                <div v-if="!order.items.length" class="alert alert-warning mb-0" role="alert">
                  Состав заказа недоступен.
                </div>
                <ul v-else class="order-items">
                  <li v-for="item in order.items" :key="item.id" class="order-item">
                    <div>
                      <p class="order-item__title">{{ item.product.title }}</p>
                      <p class="order-item__meta">
                        Артикул: {{ item.product.sku }}
                        <span v-if="item.size" class="order-item__size">· Размер: {{ item.size.size }}</span>
                      </p>
                    </div>
                    <div class="order-item__pricing">
                      <span class="order-item__price">{{ formatCurrency(item.unitPrice) }}</span>
                      <span class="order-item__quantity">× {{ item.quantity }}</span>
                      <span class="order-item__subtotal">{{ formatCurrency(getItemSubtotal(item)) }}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </transition>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import {
  fetchCustomerOrders,
  type CustomerOrderDto,
  type CustomerOrderItemDto,
} from '../api/customerOrders';
import { extractErrorMessage } from '../api/http';

const orders = ref<CustomerOrderDto[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const expandedOrderIds = ref<number[]>([]);

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString('ru-RU');
};

const isExpanded = (orderId: number) => expandedOrderIds.value.includes(orderId);

const toggleOrder = (orderId: number) => {
  if (isExpanded(orderId)) {
    expandedOrderIds.value = expandedOrderIds.value.filter((id) => id !== orderId);
  } else {
    expandedOrderIds.value = [...expandedOrderIds.value, orderId];
  }
};

const getTotalQuantity = (order: CustomerOrderDto) =>
  order.items.reduce((sum, item) => sum + item.quantity, 0);

const getItemSubtotal = (item: CustomerOrderItemDto) => item.unitPrice * item.quantity;

const loadOrders = async () => {
  try {
    loading.value = true;
    errorMessage.value = null;
    const response = await fetchCustomerOrders();
    orders.value = response;
    expandedOrderIds.value = response.length ? [response[0].id] : [];
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  position: relative;
  padding: 1.75rem;
  border-radius: 1.25rem;
  border: 1px solid var(--color-surface-border);
  background: linear-gradient(
      130deg,
      color-mix(in srgb, var(--color-surface) 92%, transparent) 0%,
      color-mix(in srgb, var(--color-surface-alt) 88%, transparent) 100%
    ),
    color-mix(in srgb, var(--color-surface) 88%, transparent);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(calc(var(--blur-radius) * 0.9));
  overflow: hidden;
}

.order-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--color-accent) 24%, transparent) 0%, transparent 55%),
    radial-gradient(120% 150% at 110% 10%, color-mix(in srgb, var(--color-glow) 30%, transparent) 0%, transparent 60%);
  opacity: 0.45;
  pointer-events: none;
}

.order-card > * {
  position: relative;
  z-index: 1;
}

.order-card__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  align-items: flex-start;
}

.order-card__number {
  display: block;
  font-weight: 600;
  font-size: 1.1rem;
}

.order-card__date {
  margin-bottom: 0;
  color: var(--color-text-muted);
}

.order-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
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

.order-card__chip-muted {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-surface-border) 80%, transparent);
  background: color-mix(in srgb, var(--color-surface-alt) 70%, transparent);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.order-card__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem 1.5rem;
  margin-top: 1.25rem;
}

.summary-item__label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.summary-item__value {
  font-weight: 600;
  margin-top: 0.35rem;
}

.order-card__actions {
  margin-top: 1.25rem;
}

.order-card__items {
  margin-top: 1.5rem;
}

.order-items {
  list-style: none;
  padding-left: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--color-surface-border) 75%, transparent);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
  box-shadow: 0 18px 28px -32px rgba(10, 12, 25, 0.85);
}

.order-item__title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.order-item__meta {
  margin-bottom: 0;
  color: var(--color-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.order-item__size {
  color: color-mix(in srgb, var(--color-text) 70%, var(--color-accent) 30%);
}

.order-item__pricing {
  display: grid;
  text-align: right;
  gap: 0.25rem;
  min-width: 140px;
}

.order-item__price {
  font-weight: 600;
}

.order-item__quantity {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.order-item__subtotal {
  font-weight: 700;
  font-size: 1.05rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 575.98px) {
  .orders-header :deep(.btn) {
    width: 100%;
  }

  .order-card {
    padding: 1.25rem;
  }

  .order-item__pricing {
    justify-items: flex-start;
    text-align: left;
  }
}
</style>

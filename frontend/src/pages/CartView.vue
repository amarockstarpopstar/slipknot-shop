<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <header class="page-header">
        <div>
          <span class="chip mb-2">Корзина</span>
          <h1 class="section-title">Ваш заказ</h1>
        </div>
      </header>

      <LoadingSpinner v-if="loading" />

      <template v-else>
        <div v-if="isEmpty" class="alert alert-info d-flex flex-column gap-3" role="alert">
          <span>Корзина пуста. Добавьте товары из каталога, чтобы оформить заказ.</span>
          <RouterLink class="btn btn-outline-secondary align-self-start" to="/">
            Перейти в каталог
          </RouterLink>
        </div>

        <div v-else class="cart-layout">
          <div class="cart-items">
            <article v-for="item in items" :key="item.id" class="cart-item">
              <div class="cart-item__image" v-if="item.product.imageUrl">
                <img :src="item.product.imageUrl" :alt="item.product.title" loading="lazy" />
              </div>
              <div v-else class="cart-item__placeholder">Фото</div>
              <div class="cart-item__content">
                <h2 class="cart-item__title">{{ item.product.title }}</h2>
                <p class="cart-item__meta">Цена: {{ formatCurrency(item.product.price) }}</p>
                <div class="cart-item__controls">
                  <span class="cart-item__label">Количество</span>
                  <div class="cart-item__buttons">
                    <button type="button" class="btn btn-outline-light" @click="decrease(item)" :disabled="updating">
                      –
                    </button>
                    <span class="cart-item__quantity">{{ item.quantity }}</span>
                    <button type="button" class="btn btn-outline-light" @click="increase(item)" :disabled="updating">
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="remove(item)"
                    :disabled="updating"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          </div>

          <aside class="cart-summary">
            <h2 class="cart-summary__title">Итог по заказу</h2>
            <p class="cart-summary__line">Товаров: <span>{{ totalQuantity }}</span></p>
            <p class="cart-summary__line">Сумма: <span>{{ formatCurrency(totalAmount) }}</span></p>
            <button
              type="button"
              class="btn btn-danger w-100"
              @click="goToPayment"
              :disabled="updating || isEmpty"
            >
              Перейти к оплате
            </button>
            <p v-if="errorMessage" class="alert alert-danger mt-3 mb-0">{{ errorMessage }}</p>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../store/cartStore';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useNavigation } from '../composables/useNavigation';
import { RouterLink } from 'vue-router';

const cartStore = useCartStore();
const { items, totalAmount, totalQuantity, isEmpty, loading, updating, error } = storeToRefs(cartStore);
const errorMessage = ref('');
const { goToCheckout } = useNavigation();

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
  void goToCheckout();
};

watch(error, (value) => {
  errorMessage.value = value ?? '';
});

onMounted(() => {
  void cartStore.loadCart();
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.cart-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
}

.cart-item__placeholder {
  display: grid;
  place-items: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-alt) 80%, transparent);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.cart-item__title {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.cart-item__meta {
  margin: 0 0 1rem;
  color: var(--color-text-muted);
}

.cart-item__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.cart-item__buttons {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--color-surface-alt) 90%, transparent);
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-lg);
}

.cart-item__quantity {
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}

.cart-item__label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cart-summary {
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border: 1px solid var(--color-surface-border);
  box-shadow: var(--shadow-card);
  position: sticky;
  top: 120px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-summary__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.cart-summary__line {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-weight: 500;
  color: var(--color-text-muted);
}

.cart-summary__line span {
  color: var(--color-text);
}

@media (max-width: 991.98px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .cart-item {
    grid-template-columns: 1fr;
  }
}
</style>

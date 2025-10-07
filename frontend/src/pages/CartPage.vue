<template>
  <section class="py-5">
    <div class="container">
      <h1 class="display-5 fw-bold mb-4">Корзина</h1>
      <div v-if="!items.length" class="alert alert-info" role="alert">
        Корзина пуста — добавьте товары из каталога.
      </div>
      <div v-else class="row g-4">
        <div class="col-lg-8">
          <div class="list-group shadow-sm">
            <div
              v-for="item in items"
              :key="item.product.id"
              class="list-group-item list-group-item-action d-flex align-items-center"
            >
              <div class="flex-grow-1">
                <h5 class="mb-1">{{ item.product.title }}</h5>
                <p class="mb-1 text-muted">{{ item.product.price.toLocaleString('ru-RU') }} ₽</p>
                <div class="d-flex align-items-center gap-2">
                  <label class="form-label mb-0" :for="`quantity-${item.product.id}`">Количество:</label>
                  <input
                    :id="`quantity-${item.product.id}`"
                    type="number"
                    class="form-control form-control-sm"
                    min="1"
                    :value="item.quantity"
                    @change="(event) => updateQuantity(item.product.id, event)"
                  />
                  <button class="btn btn-outline-danger btn-sm" @click="remove(item.product.id)">
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="h5 mb-3">Итого</h2>
              <p class="mb-1">Товаров: {{ totalCount }}</p>
              <p class="mb-3">Сумма: {{ totalPrice.toLocaleString('ru-RU') }} ₽</p>
              <button class="btn btn-danger w-100 mb-2" @click="checkout" :disabled="processing">
                Оформить заказ
              </button>
              <button class="btn btn-outline-secondary w-100" @click="clear" :disabled="processing">
                Очистить корзину
              </button>
              <p v-if="message" class="text-success small mt-3 mb-0">{{ message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();
const { items, totalCount, totalPrice } = storeToRefs(cartStore);
const processing = ref(false);
const message = ref('');

const updateQuantity = (productId: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = Number(target.value);
  if (Number.isFinite(value)) {
    cartStore.changeQuantity(productId, value);
  }
};

const remove = (productId: number) => {
  cartStore.removeFromCart(productId);
};

const clear = () => {
  cartStore.clearCart();
  message.value = 'Корзина очищена';
};

const checkout = async () => {
  try {
    processing.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    cartStore.clearCart();
    message.value = 'Заказ оформлен! Мы свяжемся с вами для подтверждения.';
  } finally {
    processing.value = false;
  }
};
</script>

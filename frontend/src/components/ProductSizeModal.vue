<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="modal-backdrop fade show"></div>
    </transition>
    <transition name="scale">
      <div
        v-if="visible"
        class="modal glass-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-modal-title"
        @click.self="emitClose"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <header class="modal-header border-0 pb-0">
              <h2 id="size-modal-title" class="modal-title h4 mb-0">
                Выберите размер
              </h2>
              <button type="button" class="btn-close" aria-label="Закрыть" @click="emitClose"></button>
            </header>
            <section class="modal-body">
              <p v-if="product" class="text-muted mb-3">
                Товар «{{ product.title }}» доступен в нескольких размерах. Выберите подходящий, чтобы добавить его в корзину.
              </p>
              <p v-else class="text-muted mb-3">
                Выберите размер товара, чтобы продолжить оформление.
              </p>
              <div v-if="availableSizes.length" class="size-options" role="group" aria-label="Выбор размера">
                <button
                  v-for="size in availableSizes"
                  :key="size.id"
                  type="button"
                  class="size-options__item"
                  :class="{ 'size-options__item--disabled': size.stock <= 0 }"
                  :disabled="size.stock <= 0 || disabled"
                  @click="handleSelect(size.id)"
                >
                  <span class="size-options__label">{{ size.size }}</span>
                  <span class="size-options__price">{{ formatCurrency(size.price) }}</span>
                  <small class="size-options__stock">{{ stockLabel(size.stock) }}</small>
                </button>
              </div>
              <p v-else class="alert alert-warning mb-0">
                Для этого товара временно нет доступных размеров.
              </p>
            </section>
            <footer class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-outline-secondary" @click="emitClose" :disabled="disabled">
                Отмена
              </button>
            </footer>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import type { ProductDto, ProductSizeDto } from '../api/products';
import { useScrollLock } from '../composables/useScrollLock';

const props = defineProps<{
  visible: boolean;
  product: ProductDto | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (event: 'select', sizeId: number): void;
  (event: 'close'): void;
}>();

const visible = computed(() => props.visible);
const product = computed(() => props.product);
const disabled = computed(() => Boolean(props.disabled));

const availableSizes = computed(() => product.value?.sizes ?? []);

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const stockLabel = (stock: ProductSizeDto['stock']) => {
  if (stock <= 0) {
    return 'Нет в наличии';
  }
  if (stock <= 3) {
    return `Осталось ${stock}`;
  }
  return `В наличии: ${stock}`;
};

const handleSelect = (sizeId: number) => {
  if (disabled.value) {
    return;
  }
  emit('select', sizeId);
};

const emitClose = () => {
  if (disabled.value) {
    return;
  }
  emit('close');
};

const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && visible.value) {
    emitClose();
  }
};

useScrollLock(visible);

watch(
  visible,
  (value) => {
    if (value) {
      window.addEventListener('keyup', handleKeyup);
      return;
    }
    window.removeEventListener('keyup', handleKeyup);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('keyup', handleKeyup);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: translateY(18px) scale(0.95);
  opacity: 0;
}

.size-options {
  display: grid;
  gap: 0.75rem;
}

.size-options__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease,
    color 0.2s ease;
  width: 100%;
}

.size-options__item:hover:not(:disabled) {
  border-color: rgba(147, 175, 255, 0.65);
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.12);
}

.size-options__item:disabled,
.size-options__item--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.size-options__label {
  font-weight: 600;
  font-size: 1rem;
  color: #ffffff;
}

.size-options__price {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.82);
}

.size-options__stock {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 575.98px) {
  .size-options {
    gap: 0.65rem;
  }

  .size-options__item {
    padding: 0.75rem 0.85rem;
  }

  .size-options__label {
    font-size: 0.95rem;
  }

  .size-options__price {
    font-size: 0.9rem;
  }
}
</style>

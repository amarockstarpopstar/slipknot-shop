<template>
  <Teleport to="body">
    <TransitionRoot :show="visible" appear as="template">
      <Dialog as="div" class="modal-layer" @close="handleDialogClose">
        <TransitionChild
          as="template"
          enter="modal-fade-enter"
          enter-from="modal-fade-enter-from"
          enter-to="modal-fade-enter-to"
          leave="modal-fade-leave"
          leave-from="modal-fade-leave-from"
          leave-to="modal-fade-leave-to"
        >
          <div class="modal-layer__backdrop" aria-hidden="true"></div>
        </TransitionChild>
        <div class="modal-layer__container">
          <TransitionChild
            as="template"
            enter="modal-panel-enter"
            enter-from="modal-panel-enter-from"
            enter-to="modal-panel-enter-to"
            leave="modal-panel-leave"
            leave-from="modal-panel-leave-from"
            leave-to="modal-panel-leave-to"
          >
            <DialogPanel class="size-dialog">
              <header class="size-dialog__header">
                <div class="size-dialog__title-wrap">
                  <DialogTitle id="size-modal-title" as="h2" class="size-dialog__title">
                    Выберите размер
                  </DialogTitle>
                  <p v-if="product" class="size-dialog__subtitle">
                    Товар «{{ product.title }}» доступен в нескольких размерах. Выберите подходящий, чтобы добавить его в корзину.
                  </p>
                  <p v-else class="size-dialog__subtitle">
                    Выберите размер товара, чтобы продолжить оформление.
                  </p>
                </div>
                <button type="button" class="size-dialog__close" aria-label="Закрыть" @click="emitClose">
                  <XMarkIcon aria-hidden="true" />
                </button>
              </header>
              <section class="size-dialog__body" :aria-labelledby="product ? 'size-modal-title' : undefined">
                <div v-if="availableSizes.length" class="size-options" role="group" aria-label="Выбор размера">
                  <button
                    v-for="size in availableSizes"
                    :key="size.id"
                    type="button"
                    class="size-options__item"
                    :class="{ 'size-options__item--disabled': size.stock <= 0, 'size-options__item--blocked': disabled }"
                    :disabled="size.stock <= 0 || disabled"
                    @click="handleSelect(size.id)"
                  >
                    <span class="size-options__label">{{ size.size }}</span>
                    <span class="size-options__price">{{ formatCurrency(size.price) }}</span>
                    <small class="size-options__stock">{{ stockLabel(size.stock) }}</small>
                  </button>
                </div>
                <div v-else class="size-dialog__empty" role="status">
                  <p>Для этого товара временно нет доступных размеров.</p>
                </div>
              </section>
              <footer class="size-dialog__footer">
                <button type="button" class="size-dialog__cancel" @click="emitClose" :disabled="disabled">
                  Отмена
                </button>
              </footer>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </Teleport>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
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

useScrollLock(visible);

const handleDialogClose = () => {
  if (disabled.value) {
    return;
  }
  emitClose();
};
</script>

<style scoped>
.modal-fade-enter,
.modal-fade-leave {
  transition: opacity 0.24s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}

.modal-panel-enter,
.modal-panel-leave {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(22px) scale(0.95);
}

.modal-panel-enter-to,
.modal-panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 1050;
}

.modal-layer__backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(115% 125% at 22% 18%, color-mix(in srgb, var(--color-accent) 28%, transparent) 0%, transparent 68%),
    radial-gradient(110% 135% at 78% 16%, color-mix(in srgb, var(--color-accent-strong) 18%, transparent) 0%, transparent 72%),
    color-mix(in srgb, var(--color-background) 86%, rgba(6, 6, 8, 0.82));
  backdrop-filter: blur(calc(var(--blur-radius, 12px) * 1.4));
}

.modal-layer__container {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 48px) clamp(16px, 4vw, 36px);
  overflow-y: auto;
}

.size-dialog {
  position: relative;
  width: min(560px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(24px, 4vw, 32px);
  border-radius: 22px;
  background: color-mix(in srgb, var(--color-surface-strong, rgba(18, 18, 22, 0.96)) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 70%, transparent);
  box-shadow:
    0 45px 100px -55px rgba(0, 0, 0, 0.7),
    0 0 0 1px color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 35%, transparent) inset,
    0 24px 60px -40px color-mix(in srgb, var(--color-accent) 26%, transparent);
  backdrop-filter: blur(calc(var(--blur-radius, 12px) * 1.2));
  max-height: min(90vh, 640px);
  overflow: hidden;
}

.size-dialog__header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.size-dialog__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.size-dialog__title {
  margin: 0;
  font-size: clamp(1.35rem, 1.1rem + 0.8vw, 1.6rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #f8f8fa;
}

.size-dialog__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(235, 235, 245, 0.72);
  line-height: 1.6;
}

.size-dialog__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  color: rgba(250, 250, 255, 0.82);
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.size-dialog__close svg {
  width: 22px;
  height: 22px;
}

.size-dialog__close:hover {
  transform: translateY(-1px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.24);
  color: #ffffff;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04));
}

.size-dialog__close:focus-visible {
  outline: 2px solid rgba(255, 77, 109, 0.65);
  outline-offset: 3px;
}

.size-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  padding-right: clamp(2px, 0.5vw, 8px);
}

.size-options {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.size-options__item {
  display: grid;
  gap: 0.35rem;
  align-items: flex-start;
  justify-items: flex-start;
  padding: 1rem 1.15rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.12)) 65%, transparent);
  background: linear-gradient(145deg, color-mix(in srgb, var(--color-surface) 82%, transparent) 0%,
      color-mix(in srgb, var(--color-surface-alt, rgba(20, 20, 20, 0.82)) 65%, transparent) 100%);
  color: color-mix(in srgb, var(--color-text, #f8f8fa) 92%, transparent);
  cursor: pointer;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  width: 100%;
}

.size-options__item:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-accent) 60%, transparent);
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%,
      color-mix(in srgb, var(--color-accent-strong, var(--color-accent)) 12%, transparent) 100%),
    linear-gradient(145deg, color-mix(in srgb, var(--color-surface) 80%, transparent) 0%,
      color-mix(in srgb, var(--color-surface-alt, rgba(20, 20, 20, 0.82)) 60%, transparent) 100%);
  box-shadow: 0 18px 45px -32px color-mix(in srgb, var(--color-accent) 70%, transparent);
}

.size-options__item:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-outline, rgba(255, 77, 109, 0.6)) 95%, transparent);
  outline-offset: 3px;
}

.size-options__item:disabled,
.size-options__item--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.size-options__item--blocked {
  cursor: progress;
  opacity: 0.65;
}

.size-options__label {
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
  color: color-mix(in srgb, var(--color-text, #ffffff) 95%, transparent);
}

.size-options__price {
  font-size: 0.95rem;
  color: color-mix(in srgb, var(--color-text-muted, rgba(255, 255, 255, 0.78)) 100%, transparent);
}

.size-options__stock {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text-muted, rgba(255, 255, 255, 0.6)) 90%, transparent);
}

.size-dialog__empty {
  padding: 1rem;
  border-radius: 16px;
  border: 1px dashed color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.24)) 75%, transparent);
  background: color-mix(in srgb, var(--color-surface, rgba(255, 255, 255, 0.05)) 65%, transparent);
  text-align: center;
  color: color-mix(in srgb, var(--color-text-muted, rgba(255, 255, 255, 0.72)) 100%, transparent);
}

.size-dialog__footer {
  display: flex;
  justify-content: flex-end;
}

.size-dialog__cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.18)) 65%, transparent);
  background: color-mix(in srgb, var(--color-surface, rgba(255, 255, 255, 0.05)) 60%, transparent);
  color: color-mix(in srgb, var(--color-text, rgba(255, 255, 255, 0.86)) 96%, transparent);
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.size-dialog__cancel:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--color-accent) 55%, transparent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  color: #ffffff;
}

.size-dialog__cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter,
  .modal-fade-leave,
  .modal-panel-enter,
  .modal-panel-leave,
  .size-options__item,
  .size-dialog__cancel {
    transition-duration: 0.01ms;
    transition-delay: 0.01ms;
  }
}

@media (max-width: 575.98px) {
  .modal-layer__container {
    padding: clamp(16px, 6vw, 28px) clamp(14px, 5vw, 22px) calc(24px + env(safe-area-inset-bottom));
    align-items: flex-end;
  }

  .size-dialog {
    padding: clamp(22px, 6vw, 28px);
    border-radius: 20px;
    gap: 1.25rem;
    max-height: min(88vh, 560px);
  }

  .size-dialog__header {
    gap: 0.75rem;
  }

  .size-dialog__close {
    width: 36px;
    height: 36px;
  }

  .size-options {
    gap: 0.75rem;
    grid-template-columns: 1fr;
  }

  .size-options__item {
    padding: 0.85rem 1rem;
  }

  .size-dialog__footer {
    justify-content: stretch;
  }

  .size-dialog__cancel {
    width: 100%;
  }
}
</style>

<template>
  <Teleport to="body">
    <TransitionRoot :show="visible" appear as="template">
      <Dialog as="div" class="modal-layer" @close="emitCancel">
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
            <DialogPanel class="confirm-dialog" aria-describedby="logout-modal-description">
              <div class="confirm-dialog__icon" aria-hidden="true">
                <ArrowRightStartOnRectangleIcon />
              </div>
              <DialogTitle id="logout-modal-title" as="h2" class="confirm-dialog__title">
                Выйти из аккаунта?
              </DialogTitle>
              <p id="logout-modal-description" class="confirm-dialog__subtitle">
                Вы сможете снова войти в любой момент. Все незавершённые действия будут отменены.
              </p>
              <div class="confirm-dialog__actions">
                <button type="button" class="confirm-dialog__action confirm-dialog__action--danger" @click="emitConfirm">
                  Выйти
                </button>
                <button type="button" class="confirm-dialog__action" @click="emitCancel">
                  Остаться
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </Teleport>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import { useScrollLock } from '../composables/useScrollLock';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

const visible = computed(() => props.visible);

useScrollLock(visible);

const emitConfirm = () => {
  emit('confirm');
};

const emitCancel = () => {
  emit('cancel');
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
  transform: translateY(18px) scale(0.95);
}

.modal-panel-enter-to,
.modal-panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

:global(.modal-layer) {
  position: fixed;
  inset: 0;
  z-index: 1050;
}

.modal-layer__backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(120% 130% at 20% 10%, color-mix(in srgb, var(--color-accent) 22%, transparent) 0%, transparent 70%),
    radial-gradient(140% 160% at 80% 0%, color-mix(in srgb, var(--color-accent-strong) 16%, transparent) 0%, transparent 72%),
    color-mix(in srgb, var(--color-background) 88%, rgba(6, 6, 8, 0.82));
  backdrop-filter: blur(calc(var(--blur-radius, 12px) * 1.2));
}

.modal-layer__container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(18px, 5vw, 44px);
  overflow-y: auto;
}

.confirm-dialog {
  width: min(420px, 100%);
  padding: clamp(24px, 5vw, 32px);
  border-radius: 24px;
  background: color-mix(in srgb, var(--color-surface-strong, rgba(18, 18, 22, 0.95)) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 70%, transparent);
  box-shadow:
    0 35px 80px -55px rgba(0, 0, 0, 0.75),
    0 0 0 1px color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 40%, transparent) inset,
    0 18px 45px -32px color-mix(in srgb, var(--color-accent) 26%, transparent);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  text-align: center;
  position: relative;
  isolation: isolate;
}

.confirm-dialog__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  border-radius: 22px;
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--color-accent) 35%, transparent) 0%,
      color-mix(in srgb, var(--color-accent-strong, var(--color-accent)) 18%, transparent) 100%),
    linear-gradient(140deg, color-mix(in srgb, var(--color-surface) 75%, transparent) 0%,
      color-mix(in srgb, var(--color-surface-alt, rgba(20, 20, 20, 0.82)) 60%, transparent) 100%);
  color: color-mix(in srgb, var(--color-text, rgba(255, 255, 255, 0.9)) 96%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.1)) 85%, transparent);
}

.confirm-dialog__icon svg {
  width: 32px;
  height: 32px;
}

.confirm-dialog__title {
  margin: 0;
  font-size: clamp(1.3rem, 1.1rem + 0.5vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: color-mix(in srgb, var(--color-text, rgba(255, 255, 255, 0.94)) 96%, transparent);
}

.confirm-dialog__subtitle {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: color-mix(in srgb, var(--color-text-muted, rgba(235, 235, 245, 0.7)) 95%, transparent);
}

.confirm-dialog__actions {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.75rem;
}

.confirm-dialog__action {
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.16)) 70%, transparent);
  background: color-mix(in srgb, var(--color-surface, rgba(255, 255, 255, 0.04)) 70%, transparent);
  color: color-mix(in srgb, var(--color-text, rgba(255, 255, 255, 0.92)) 96%, transparent);
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.confirm-dialog__action:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.28)) 85%, transparent);
  background: color-mix(in srgb, var(--color-surface, rgba(255, 255, 255, 0.1)) 80%, transparent);
}

.confirm-dialog__action--danger {
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--color-accent) 82%, transparent) 0%,
      color-mix(in srgb, var(--color-accent-strong, var(--color-accent)) 60%, transparent) 100%),
    color-mix(in srgb, var(--color-surface, rgba(255, 255, 255, 0.04)) 40%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 80%, transparent);
  color: #ffffff;
  box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.confirm-dialog__action--danger:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-accent) 92%, transparent);
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--color-accent) 94%, transparent) 0%,
      color-mix(in srgb, var(--color-accent-strong, var(--color-accent)) 78%, transparent) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter,
  .modal-fade-leave,
  .modal-panel-enter,
  .modal-panel-leave,
  .confirm-dialog__action {
    transition-duration: 0.01ms;
    transition-delay: 0.01ms;
  }
}

@media (min-width: 520px) {
  .confirm-dialog__actions {
    flex-direction: row;
  }

  .confirm-dialog__action {
    flex: 1;
  }
}

@media (max-width: 575.98px) {
  .modal-layer__container {
    padding: clamp(18px, 6vw, 28px) clamp(16px, 5vw, 22px) calc(24px + env(safe-area-inset-bottom));
    align-items: center;
  }

  .confirm-dialog {
    border-radius: 22px;
    gap: 1.1rem;
  }
}
</style>

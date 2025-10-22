<template>
  <Teleport to="body">
    <TransitionRoot :show="visible" appear as="template">
      <Dialog as="div" class="modal-layer" @close="handleClose">
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
        <div class="modal-layer__container" :class="containerClass">
          <TransitionChild
            as="template"
            enter="modal-panel-enter"
            enter-from="modal-panel-enter-from"
            enter-to="modal-panel-enter-to"
            leave="modal-panel-leave"
            leave-from="modal-panel-leave-from"
            leave-to="modal-panel-leave-to"
          >
            <DialogPanel
              class="glass-modal-panel"
              :class="panelClass"
              :style="{ maxWidth }"
            >
              <slot />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { computed, toRef } from 'vue';
import { useScrollLock } from '../composables/useScrollLock';

type ClassBinding = string | Record<string, boolean> | Array<string | Record<string, boolean>>;

const props = withDefaults(
  defineProps<{
    visible: boolean;
    panelClass?: ClassBinding;
    containerClass?: ClassBinding;
    maxWidth?: string;
    preventClose?: boolean;
  }>(),
  {
    panelClass: () => [],
    containerClass: () => [],
    maxWidth: '640px',
    preventClose: false,
  },
);

const emit = defineEmits<{ (event: 'close'): void }>();

const visibleRef = toRef(props, 'visible');

useScrollLock(visibleRef);

const maxWidth = computed(() => props.maxWidth || '640px');

const handleClose = () => {
  if (props.preventClose) {
    return;
  }
  emit('close');
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

:global(.modal-layer) {
  position: fixed;
  inset: 0;
  z-index: 1050;
}

.modal-layer__backdrop {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(115% 125% at 22% 18%, color-mix(in srgb, var(--color-accent) 24%, transparent) 0%, transparent 70%),
    radial-gradient(125% 145% at 78% 16%, color-mix(in srgb, var(--color-accent-strong) 18%, transparent) 0%, transparent 75%),
    color-mix(in srgb, var(--color-background) 86%, rgba(6, 6, 8, 0.82));
  backdrop-filter: blur(calc(var(--blur-radius, 12px) * 1.35));
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

.glass-modal-panel {
  width: min(100%, var(--modal-max-width, 640px));
  max-width: 100%;
  border-radius: clamp(20px, 4vw, 28px);
  background: color-mix(in srgb, var(--color-surface-strong, rgba(12, 12, 12, 0.92)) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 65%, transparent);
  box-shadow:
    0 42px 90px -55px rgba(0, 0, 0, 0.78),
    0 0 0 1px color-mix(in srgb, var(--color-surface-border, rgba(255, 255, 255, 0.08)) 45%, transparent) inset,
    0 22px 55px -35px color-mix(in srgb, var(--color-accent) 24%, transparent);
  padding: clamp(20px, 4vw, 32px);
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
}

:global([data-theme='light']) .glass-modal-panel {
  background: color-mix(in srgb, var(--color-surface-strong, rgba(255, 255, 255, 0.96)) 96%, transparent);
  box-shadow:
    0 40px 90px -52px rgba(15, 23, 42, 0.28),
    0 0 0 1px color-mix(in srgb, var(--color-surface-border, rgba(214, 214, 214, 0.7)) 55%, transparent) inset,
    0 18px 48px -30px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

@media (max-width: 640px) {
  .modal-layer__container {
    padding: clamp(16px, 6vw, 28px) clamp(12px, 5vw, 20px);
    align-items: flex-start;
  }

  .glass-modal-panel {
    width: 100%;
    border-radius: clamp(16px, 6vw, 22px);
    padding: clamp(18px, 5vw, 24px);
  }
}
</style>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="modal-backdrop fade show"></div>
    </transition>
    <transition name="scale">
      <div
        v-if="visible"
        class="modal d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg">
            <div class="modal-body text-center p-4">
              <p id="logout-modal-title" class="fs-5 mb-4">
                Вы действительно хотите выйти из аккаунта?
              </p>
              <div class="d-flex justify-content-center gap-3">
                <button type="button" class="btn btn-danger" @click="emitConfirm">Да</button>
                <button type="button" class="btn btn-outline-secondary" @click="emitCancel">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

const visible = computed(() => props.visible);

const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && visible.value) {
    emit('cancel');
  }
};

watch(
  visible,
  (value) => {
    if (value) {
      window.addEventListener('keyup', handleKeyup);
      document.body.classList.add('modal-open');
    } else {
      window.removeEventListener('keyup', handleKeyup);
      document.body.classList.remove('modal-open');
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keyup', handleKeyup);
  document.body.classList.remove('modal-open');
});

const emitConfirm = () => {
  emit('confirm');
};

const emitCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

:global(body.modal-open) {
  overflow: hidden;
}
</style>

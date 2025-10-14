<template>
  <div class="loading-block" role="status" aria-live="polite">
    <span class="loading-ring"></span>
    <span class="loading-label">Загрузка...</span>
  </div>
</template>

<script setup lang="ts">
// visually enhanced spinner matching the new design language
</script>

<style scoped>
.loading-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: var(--color-text-muted);
}

.loading-ring {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  border-top-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
  animation: spin 1s linear infinite;
  box-shadow: 0 0 25px -12px var(--color-glow);
}

.loading-label {
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

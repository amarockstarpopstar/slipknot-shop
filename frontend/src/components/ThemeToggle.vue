<template>
  <button class="theme-toggle" type="button" @click="toggle" :aria-label="label">
    <span class="theme-toggle__icon" aria-hidden="true">{{ icon }}</span>
    <span class="theme-toggle__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '../store/themeStore';

const themeStore = useThemeStore();

const icon = computed(() => (themeStore.theme === 'dark' ? '☀️' : '🌙'));
const label = computed(() => (themeStore.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'));

const toggle = async () => {
  await themeStore.toggleTheme();
};
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-outline);
  background: color-mix(in srgb, var(--color-surface) 70%, transparent);
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-base), box-shadow var(--transition-base),
    border-color var(--transition-base), transform var(--transition-base);
  box-shadow: var(--shadow-soft);
  font-weight: 500;
}

.theme-toggle:hover {
  border-color: color-mix(in srgb, var(--color-accent) 70%, transparent);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.theme-toggle:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-accent) 60%, transparent);
  outline-offset: 3px;
}

.theme-toggle__icon {
  font-size: 1.25rem;
  line-height: 1;
}

.theme-toggle__label {
  font-size: 0.9rem;
}
</style>

<template>
  <div class="theme-provider" :class="`theme-provider--${theme}`">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useThemeStore } from '../store/themeStore';

const themeStore = useThemeStore();

const theme = computed(() => themeStore.theme);

onMounted(() => {
  void themeStore.initialize();
});

watch(theme, () => {
  themeStore.applyTheme();
});
</script>

<style scoped>
.theme-provider {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}
</style>

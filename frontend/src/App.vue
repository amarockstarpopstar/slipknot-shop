<template>
  <ThemeProvider>
    <div class="app-shell fade-in-up">
      <AppNavbar />
      <main class="app-main">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </main>
      <footer class="app-footer">
        <div class="layout-container text-center">
          <p class="fw-semibold">© {{ currentYear }} Slipknot Shop. Все права защищены.</p>
          <p class="small">Официальный мерч для настоящих маггтов.</p>
        </div>
      </footer>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';
import ThemeProvider from './components/ThemeProvider.vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <div class="bg-light min-vh-100 d-flex flex-column">
    <AppNavbar />
    <main class="flex-grow-1">
      <RouterView />
    </main>
    <footer class="bg-dark text-white py-4 mt-auto">
      <div class="container text-center">
        <p class="mb-1">© {{ currentYear }} Slipknot Shop. Все права защищены.</p>
        <p class="mb-0 small">Официальный мерч для настоящих маггтов.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import AppNavbar from './components/AppNavbar.vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

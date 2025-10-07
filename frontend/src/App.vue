<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="logos">
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" class="logo" alt="Логотип Vite" />
    </a>
    <a href="https://vuejs.org/" target="_blank" rel="noreferrer">
      <img src="./assets/vue.svg" class="logo vue" alt="Логотип Vue" />
    </a>
  </div>
  <HelloWorld msg="Стартовый интерфейс магазина Slipknot" />
</template>

<style scoped>
.logos {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

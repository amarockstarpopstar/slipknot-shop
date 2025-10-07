<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">Счётчик кликов: {{ count }}</button>
    <p>
      Измените <code>components/HelloWorld.vue</code>, чтобы настроить приветственный блок под ваши нужды.
    </p>
  </div>

  <p>
    Полезные ссылки:
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" rel="noreferrer">документация Vue</a>
    и
    <a
      href="https://vite.dev/guide/"
      target="_blank"
      rel="noreferrer"
      >руководство по Vite</a
    >.
  </p>
  <p class="read-the-docs">Нажмите на логотипы Vite и Vue, чтобы узнать больше.</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

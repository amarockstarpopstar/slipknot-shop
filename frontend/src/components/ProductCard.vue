<template>
  <div class="card h-100 shadow-sm">
    <img
      v-if="product.imageUrl"
      :src="product.imageUrl"
      class="card-img-top"
      :alt="`Изображение ${product.title}`"
    />
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ product.title }}</h5>
      <p class="card-text text-muted small mb-2">
        {{ product.category?.name ?? 'Категория не указана' }}
      </p>
      <p class="card-text flex-grow-1">
        {{ product.description ?? 'Описание появится позже' }}
      </p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="fw-bold text-danger">{{ product.price.toLocaleString('ru-RU') }} ₽</span>
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductDto } from '../api/products';

defineProps<{
  product: ProductDto;
}>();
</script>

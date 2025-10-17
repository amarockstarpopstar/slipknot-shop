<template>
  <article class="product-card fade-in-up" data-delay="1">
    <div v-if="product.imageUrl" class="product-card__media">
      <img :src="product.imageUrl" :alt="`Изображение ${product.title}`" loading="lazy" />
    </div>
    <div v-else class="product-card__placeholder">Фото появится позже</div>
    <div class="product-card__body">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <p class="product-card__category">{{ product.category?.name ?? 'Категория не указана' }}</p>
      <p class="product-card__description">{{ product.description ?? 'Описание появится позже' }}</p>
      <div class="product-card__footer">
        <span class="product-card__price">{{ priceLabel }}</span>
        <div class="product-card__actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProductDto } from '../api/products';

const props = defineProps<{
  product: ProductDto;
}>();

const priceLabel = computed(() => {
  const formatted = props.product.price.toLocaleString('ru-RU');
  if (props.product.sizes.length) {
    return `от ${formatted} ₽`;
  }
  return `${formatted} ₽`;
});
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-surface-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  min-height: 100%;
  transition: transform var(--transition-base), box-shadow var(--transition-base),
    border-color var(--transition-base);
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent 55%);
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.product-card:hover::before {
  opacity: 1;
}

.product-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  transition: transform var(--transition-base);
}

.product-card:hover .product-card__media img {
  transform: scale(1.04);
}

.product-card__placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  background: color-mix(in srgb, var(--color-surface-alt) 80%, transparent);
  color: var(--color-text-muted);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.product-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  flex: 1;
}

.product-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.product-card__category {
  margin: 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.product-card__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  flex: 1;
}

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.product-card__price {
  font-weight: 700;
  font-size: 1.3rem;
  color: color-mix(in srgb, var(--color-danger) 60%, var(--color-text));
}

.product-card__actions :deep(.btn) {
  box-shadow: none;
  margin-left: 0.5rem;
}

.product-card__actions :deep(.btn:first-child) {
  margin-left: 0;
}

@media (max-width: 575.98px) {
  .product-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .product-card__actions :deep(.btn) {
    width: 100%;
    margin-left: 0;
  }
}
</style>

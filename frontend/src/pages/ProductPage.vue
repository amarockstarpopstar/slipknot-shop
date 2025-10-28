<template>
  <section class="section fade-in-up">
    <div class="layout-container">
      <RouterLink to="/" class="accent-link d-inline-flex align-items-center mb-4">
        ← Назад к каталогу
      </RouterLink>
      <LoadingSpinner v-if="loading" />
      <div v-else>
        <div v-if="productError" class="alert alert-danger" role="alert">
          {{ productError }}
        </div>
        <div v-else-if="product" class="product-layout">
          <div class="product-gallery">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              class="product-gallery__image"
              :alt="`Изображение ${product.title}`"
            />
            <div v-else class="product-gallery__placeholder">Фото появится позже</div>
          </div>
          <div class="product-details">
            <h1 class="product-details__title">{{ product.title }}</h1>
            <p class="product-details__category">Категория: {{ product.category?.name ?? 'не указана' }}</p>
            <p class="product-details__description">{{ product.description ?? 'Описание будет добавлено позже.' }}</p>
            <div class="product-details__meta">
              <span>Артикул: {{ product.sku }}</span>
              <span v-if="hasSizes">Размеров в наличии: {{ availableSizes.length }}</span>
              <span v-else>Размер: универсальный</span>
            </div>
            <div v-if="hasSizes" class="product-details__inventory">
              <p class="product-details__inventory-label">Выберите размер</p>
              <div class="product-sizes" role="group" aria-label="Выбор размера товара">
                <button
                  v-for="size in availableSizes"
                  :key="size.id"
                  type="button"
                  class="product-sizes__option"
                  :class="{
                    'product-sizes__option--selected': size.id === selectedSizeId,
                    'product-sizes__option--empty': size.stock <= 0,
                  }"
                  :disabled="size.stock <= 0"
                  @click="selectSize(size.id)"
                >
                  <span class="product-sizes__label">{{ size.size }}</span>
                  <span class="product-sizes__price">{{ formatCurrency(size.price) }}</span>
                  <small class="product-sizes__stock">Остаток: {{ size.stock }}</small>
                </button>
              </div>
              <p
                v-if="selectedSize"
                class="product-details__stock"
                :class="{ 'product-details__stock--empty': selectedSize.stock <= 0 }"
              >
                Остаток выбранного размера: {{ selectedSize.stock }} шт.
              </p>
              <p
                v-if="!hasAvailableSizes"
                class="product-details__stock product-details__stock--empty"
              >
                Все размеры временно отсутствуют.
              </p>
            </div>
            <div v-else class="product-details__inventory">
              <p class="product-details__stock">Универсальный размер, доступен для заказа.</p>
            </div>
            <div class="product-details__actions">
              <span class="product-details__price">{{ formatCurrency(displayPrice) }}</span>
              <div class="product-details__buttons">
                <button
                  class="btn btn-danger btn-lg"
                  type="button"
                  @click="openConfirm"
                  :disabled="isPurchaseDisabled"
                >
                  Оформить
                </button>
                <button
                  class="btn btn-outline-light btn-lg"
                  type="button"
                  @click="addToCart(product)"
                  :disabled="isAddToCartDisabled"
                >
                  Добавить в корзину
                </button>
              </div>
            </div>
            <div class="product-details__info">
              Бесплатная доставка по России при заказе от 7 000 ₽
            </div>
          </div>
        </div>
        <section v-if="product" class="product-reviews">
          <header class="product-reviews__header">
            <h2 class="product-reviews__title">Отзывы покупателей</h2>
            <p class="product-reviews__subtitle">
              Узнайте впечатления других фанатов и поделитесь своим опытом после покупки.
            </p>
          </header>
          <div v-if="reviewsError" class="alert alert-danger" role="alert">
            {{ reviewsError }}
          </div>
          <LoadingSpinner v-else-if="reviewsLoading" />
          <div v-else class="product-reviews__content">
            <ul v-if="productReviews.length" class="product-reviews__list">
              <li v-for="review in productReviews" :key="review.id" class="product-reviews__item">
                <article class="review-card">
                  <header class="review-card__header">
                    <div class="review-card__identity">
                      <span class="review-card__author">{{ review.author.name }}</span>
                      <span class="review-card__date">{{ formatDateTime(review.createdAt) }}</span>
                    </div>
                    <div
                      class="review-card__rating"
                      :aria-label="`Оценка ${review.rating} из 5`"
                    >
                      <span class="review-card__stars" aria-hidden="true">
                        {{ getRatingStars(review.rating) }}
                      </span>
                      <span class="review-card__rating-value">{{ review.rating }} / 5</span>
                    </div>
                  </header>
                  <p v-if="review.comment" class="review-card__comment">{{ review.comment }}</p>
                </article>
              </li>
            </ul>
            <p v-else class="product-reviews__empty text-muted">
              Пока нет отзывов — станьте первым, кто расскажет о своём заказе.
            </p>
          </div>

          <div class="product-reviews__form">
            <h3 class="product-reviews__form-title">Оставить отзыв</h3>
            <div v-if="reviewSuccess" class="alert alert-success" role="status">
              {{ reviewSuccess }}
            </div>
            <div v-if="reviewError" class="alert alert-danger" role="alert">
              {{ reviewError }}
            </div>
            <div v-if="isAuthenticated && eligibilityError" class="alert alert-danger" role="alert">
              {{ eligibilityError }}
            </div>
            <div v-if="!isAuthenticated" class="alert alert-warning" role="alert">
              Авторизуйтесь, чтобы поделиться впечатлениями о покупке.
            </div>
            <div v-else class="product-reviews__form-body">
              <div v-if="eligibilityLoading" class="product-reviews__eligibility text-muted">
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Проверяем возможность оставить отзыв...
              </div>
              <p
                v-else-if="!hasPurchasedProduct"
                class="alert alert-info product-reviews__hint"
                role="alert"
              >
                Оставить отзыв можно только после покупки этого товара.
              </p>
              <p
                v-else-if="alreadyReviewed"
                class="alert alert-info product-reviews__hint"
                role="alert"
              >
                Вы уже отправили отзыв. Он появится после проверки модератором.
              </p>
              <form class="review-form" @submit.prevent="submitReview">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label for="reviewRating" class="form-label">Оценка</label>
                    <select
                      id="reviewRating"
                      v-model.number="reviewForm.rating"
                      class="form-select"
                      :disabled="reviewSubmitting || !canSubmitReview"
                      required
                    >
                      <option v-for="score in ratingOptions" :key="score" :value="score">
                        {{ score }} / 5
                      </option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label for="reviewComment" class="form-label">Комментарий</label>
                    <textarea
                      id="reviewComment"
                      v-model="reviewForm.comment"
                      class="form-control"
                      rows="4"
                      placeholder="Расскажите, что понравилось или что можно улучшить"
                      :disabled="reviewSubmitting || !canSubmitReview"
                      maxlength="2000"
                    ></textarea>
                    <small class="text-muted">Максимум 2000 символов.</small>
                  </div>
                </div>
                <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 mt-3">
                  <button
                    type="submit"
                    class="btn btn-danger px-4"
                    :disabled="reviewSubmitting || !canSubmitReview"
                  >
                    <span
                      v-if="reviewSubmitting"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Отправить отзыв
                  </button>
                  <p v-if="canSubmitReview" class="product-reviews__hint text-muted mb-0">
                    Отзыв появится после проверки модератором.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
        <div v-else class="alert alert-info" role="alert">
          Товар не найден или был удалён.
        </div>
      </div>
    </div>

    <GlassModal
      :visible="showConfirm"
      max-width="560px"
      :prevent-close="confirmLoading"
      @close="closeConfirm"
    >
      <div class="confirm-modal product-confirm">
        <div class="confirm-modal__icon" aria-hidden="true">
          <CreditCardIcon />
        </div>
        <DialogTitle id="product-checkout-modal-title" as="h2" class="confirm-modal__title">
          Подтвердите оформление
        </DialogTitle>
        <div class="product-confirm__details" aria-labelledby="product-checkout-modal-title">
          <p id="product-checkout-modal-description" class="product-confirm__text">
            Вы собираетесь оформить заказ на товар «{{ product?.title ?? '' }}» стоимостью
            <span class="product-confirm__highlight">{{ formatCurrency(displayPrice) }}</span>.
          </p>
          <p v-if="selectedSize" class="product-confirm__meta">
            Выбранный размер: {{ selectedSize.size }}
          </p>
          <p class="product-confirm__note">
            После подтверждения товар будет добавлен в корзину, и вы перейдёте к оплате.
          </p>
          <p v-if="confirmError" class="product-confirm__error" role="alert">{{ confirmError }}</p>
        </div>
        <div class="confirm-modal__actions">
          <button
            type="button"
            class="dialog-button dialog-button--ghost"
            :disabled="confirmLoading"
            @click="closeConfirm"
          >
            Отменить
          </button>
          <button
            type="button"
            class="dialog-button dialog-button--primary"
            :disabled="confirmLoading"
            @click="confirmPurchase"
          >
            <span v-if="confirmLoading">Переход...</span>
            <span v-else>Перейти к оплате</span>
          </button>
        </div>
      </div>
    </GlassModal>
  </section>
</template>

<script setup lang="ts">
import { DialogTitle } from '@headlessui/vue';
import { CreditCardIcon } from '@heroicons/vue/24/outline';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import GlassModal from '../components/GlassModal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '../composables/useNavigation';
import { useReviewsStore } from '../store/reviewsStore';

const route = useRoute();
const { safePush, goToCheckout } = useNavigation();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const reviewsStore = useReviewsStore();

const { selected: product, loading, error: productError } = storeToRefs(productStore);
const { error: cartError } = storeToRefs(cartStore);
const { isAuthenticated } = storeToRefs(authStore);
const reviewsRefs = storeToRefs(reviewsStore);
const reviewsByProduct = reviewsRefs.reviewsByProduct;
const reviewsLoading = reviewsRefs.productLoading;
const reviewsError = reviewsRefs.productError;
const eligibilityByProduct = reviewsRefs.eligibilityByProduct;
const eligibilityLoading = reviewsRefs.eligibilityLoading;
const eligibilityError = reviewsRefs.eligibilityError;

const showConfirm = ref(false);
const confirmLoading = ref(false);
const confirmError = ref<string | null>(null);

const ratingOptions = [5, 4, 3, 2, 1];

const reviewForm = reactive({
  rating: 5,
  comment: '',
});
const reviewSubmitting = ref(false);
const reviewSuccess = ref<string | null>(null);
const reviewError = ref<string | null>(null);

const selectedSizeId = ref<number | null>(null);

const availableSizes = computed(() => product.value?.sizes ?? []);
const hasSizes = computed(() => availableSizes.value.length > 0);
const hasAvailableSizes = computed(() =>
  availableSizes.value.some((size) => size.stock > 0),
);
const selectedSize = computed(() =>
  availableSizes.value.find((size) => size.id === selectedSizeId.value) ?? null,
);
const displayPrice = computed(() =>
  selectedSize.value?.price ?? product.value?.price ?? 0,
);
const isOutOfStock = computed(() => {
  if (!hasSizes.value) {
    return false;
  }

  if (!hasAvailableSizes.value) {
    return true;
  }

  return !selectedSize.value || selectedSize.value.stock <= 0;
});
const isAddToCartDisabled = computed(() => isOutOfStock.value);
const isPurchaseDisabled = computed(() => isOutOfStock.value);

const selectSize = (sizeId: number) => {
  const size = availableSizes.value.find((item) => item.id === sizeId);
  if (!size || size.stock <= 0) {
    return;
  }
  selectedSizeId.value = sizeId;
};

const formatCurrency = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

const productReviews = computed(() => {
  const id = product.value?.id;
  if (!id) {
    return [];
  }
  return reviewsByProduct.value[id] ?? [];
});

const eligibilityInfo = computed(() => {
  const id = product.value?.id;
  if (!id) {
    return null;
  }
  return eligibilityByProduct.value[id] ?? null;
});

const canSubmitReview = computed(() => Boolean(eligibilityInfo.value?.canReview));
const hasPurchasedProduct = computed(() => Boolean(eligibilityInfo.value?.hasPurchased));
const alreadyReviewed = computed(() => Boolean(eligibilityInfo.value?.alreadyReviewed));

const getRatingStars = (rating: number): string => {
  const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
  const filled = '★'.repeat(safeRating);
  const empty = '☆'.repeat(5 - safeRating);
  return `${filled}${empty}`;
};

const formatDateTime = (value: string | Date): string => {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    console.warn('Failed to format review date', error);
    return '';
  }
};

const loadProduct = async (id: number) => {
  const productLoaded = await productStore.loadOne(id);
  if (!productLoaded) {
    showConfirm.value = false;
  }
};

const addToCart = async (item: NonNullable<typeof product.value>) => {
  if (isOutOfStock.value) {
    return;
  }

  await cartStore.addProduct(item.id, 1, selectedSize.value?.id ?? null);
};

const openConfirm = () => {
  if (!product.value) {
    return;
  }
  if (isOutOfStock.value) {
    return;
  }
  if (!isAuthenticated.value) {
    void safePush({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }
  confirmError.value = null;
  cartError.value = null;
  showConfirm.value = true;
};

const closeConfirm = () => {
  if (confirmLoading.value) {
    return;
  }
  showConfirm.value = false;
};

const confirmPurchase = async () => {
  if (!product.value) {
    return;
  }
  confirmLoading.value = true;
  confirmError.value = null;
  cartError.value = null;
  await cartStore.addProduct(
    product.value.id,
    1,
    selectedSize.value?.id ?? null,
  );
  if (cartError.value) {
    confirmError.value = cartError.value;
    confirmLoading.value = false;
    return;
  }
  confirmLoading.value = false;
  showConfirm.value = false;
  await goToCheckout();
};

onMounted(async () => {
  const id = Number(route.params.id);
  if (Number.isFinite(id)) {
    await loadProduct(id);
  }
});

watch(
  () => route.params.id,
  async (value) => {
    const id = Number(value);
    if (Number.isFinite(id)) {
      await loadProduct(id);
    }
  },
);

watch(
  () => product.value?.sizes,
  (sizes) => {
    if (!sizes || sizes.length === 0) {
      selectedSizeId.value = null;
      return;
    }

    const current = sizes.find(
      (size) => size.id === selectedSizeId.value && size.stock > 0,
    );

    if (current) {
      selectedSizeId.value = current.id;
      return;
    }

    const firstAvailable = sizes.find((size) => size.stock > 0);
    if (firstAvailable) {
      selectedSizeId.value = firstAvailable.id;
      return;
    }

    selectedSizeId.value = sizes[0]?.id ?? null;
  },
  { immediate: true, deep: true },
);

watch(
  () => product.value?.id,
  (productId) => {
    reviewSuccess.value = null;
    reviewError.value = null;
    reviewForm.rating = 5;
    reviewForm.comment = '';

    if (typeof productId !== 'number') {
      return;
    }

    void reviewsStore.loadProductReviews(productId);
    if (isAuthenticated.value) {
      void reviewsStore.checkEligibility(productId);
    } else {
      reviewsStore.removeEligibilityForProduct(productId);
    }
  },
  { immediate: true },
);

watch(
  () => isAuthenticated.value,
  (authenticated) => {
    const productId = product.value?.id;
    if (typeof productId !== 'number') {
      return;
    }

    if (authenticated) {
      void reviewsStore.checkEligibility(productId);
      return;
    }

    reviewsStore.removeEligibilityForProduct(productId);
  },
);

watch(cartError, (value) => {
  if (value && showConfirm.value && !confirmLoading.value) {
    confirmError.value = value;
  }
});

const submitReview = async () => {
  if (!product.value || reviewSubmitting.value || !canSubmitReview.value) {
    return;
  }

  reviewSubmitting.value = true;
  reviewError.value = null;
  reviewSuccess.value = null;

  try {
    await reviewsStore.submitReview({
      productId: product.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim().length
        ? reviewForm.comment.trim()
        : undefined,
    });
    reviewSuccess.value = 'Спасибо! Отзыв отправлен на модерацию и скоро появится на странице товара.';
    reviewForm.comment = '';
    reviewForm.rating = 5;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось отправить отзыв';
    reviewError.value = message;
  } finally {
    reviewSubmitting.value = false;
  }
};
</script>

<style scoped>
.product-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 3.5rem);
  align-items: start;
}

.product-gallery {
  position: sticky;
  top: 120px;
}

.product-gallery__image {
  width: 100%;
  border-radius: calc(var(--radius-lg) * 1.2);
  box-shadow: var(--shadow-card);
}

.product-gallery__placeholder {
  display: grid;
  place-items: center;
  border-radius: calc(var(--radius-lg) * 1.2);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
  color: var(--color-text-muted);
  padding: 4rem 2rem;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(1.5rem, 3vw, 2rem);
  border-radius: calc(var(--radius-lg) * 1.2);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-card);
}

.product-details__title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 700;
}

.product-details__category {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.product-details__description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.product-details__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.product-details__inventory {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-details__inventory-label {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.product-sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.product-sizes__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-radius: calc(var(--radius-lg) * 0.6);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface-alt) 85%, transparent);
  color: inherit;
  transition: transform var(--transition-base), border-color var(--transition-base),
    background var(--transition-base);
}

.product-sizes__option:hover:not(:disabled),
.product-sizes__option--selected {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.product-sizes__option:disabled,
.product-sizes__option--empty {
  cursor: not-allowed;
  opacity: 0.6;
}

.product-sizes__label {
  font-weight: 600;
  letter-spacing: 0.08em;
}

.product-sizes__price {
  display: block;
  font-weight: 600;
  margin-top: 0.2rem;
  color: var(--color-text);
}

.product-sizes__stock {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.product-details__stock {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.product-details__stock--empty {
  color: #f87171;
  font-weight: 600;
}

.product-details__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.product-details__price {
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 700;
  color: color-mix(in srgb, var(--color-danger) 60%, var(--color-text));
}

.product-details__buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.product-details__info {
  padding: 1rem 1.2rem;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-accent) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
  font-size: 0.95rem;
  color: var(--color-text);
}

.product-confirm {
  width: 100%;
}

.product-confirm__details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  align-items: center;
}

.product-confirm__text,
.product-confirm__note,
.product-confirm__meta {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text) 92%, transparent);
  text-align: center;
}

.product-confirm__meta {
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--color-text-muted) 94%, transparent);
}

.product-confirm__note {
  color: color-mix(in srgb, var(--color-text-muted) 92%, transparent);
}

.product-confirm__highlight {
  color: color-mix(in srgb, var(--color-accent) 70%, var(--color-text));
  font-weight: 600;
}

.product-confirm__error {
  width: 100%;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: calc(var(--radius-lg) * 0.6);
  background: color-mix(in srgb, var(--color-danger) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 45%, transparent);
  color: color-mix(in srgb, #fee2e2 85%, var(--color-text));
  font-weight: 600;
  text-align: center;
  box-shadow: 0 22px 40px -32px color-mix(in srgb, var(--color-danger) 55%, transparent);
}

.product-reviews {
  margin-top: clamp(3rem, 6vw, 4rem);
  padding: clamp(1.75rem, 3vw, 2.25rem);
  border-radius: calc(var(--radius-lg) * 1.2);
  border: 1px solid var(--color-surface-border);
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2rem);
}

.product-reviews__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-reviews__title {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
}

.product-reviews__subtitle {
  margin: 0;
  color: var(--color-text-muted);
}


.product-reviews__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-reviews__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: clamp(1.5rem, 3vw, 1.85rem);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.product-reviews__item {
  margin: 0;
}

.review-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border-radius: calc(var(--radius-lg) * 1.1);
  border: 1px solid color-mix(in srgb, var(--color-surface-border) 65%, transparent);
  background: color-mix(in srgb, var(--color-surface-strong, var(--color-surface)) 80%, transparent);
  box-shadow: 0 22px 45px -40px rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(calc(var(--blur-radius) * 0.6));
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.review-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.review-card:hover::before {
  opacity: 1;
}

.review-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.review-card__identity {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: min(100%, 22rem);
}

.review-card__author {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.01em;
}

.review-card__date {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.review-card__rating {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 60%, transparent);
  background: color-mix(in srgb, var(--color-accent) 25%, transparent);
  color: color-mix(in srgb, #fcd34d 70%, var(--color-text));
  font-weight: 600;
  white-space: nowrap;
}

.review-card__stars {
  font-size: 1.2rem;
  letter-spacing: 0.16em;
}

.review-card__rating-value {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text) 80%, var(--color-accent) 20%);
}

.review-card__comment {
  margin: 0;
  color: var(--color-text);
  line-height: 1.7;
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  max-width: 68ch;
  word-break: break-word;
  white-space: pre-line;
}

.product-reviews__empty {
  margin: 0;
}

.product-reviews__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.product-reviews__form-title {
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 600;
}

.product-reviews__form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-reviews__hint {
  color: var(--color-text-muted);
}

.product-reviews__eligibility {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 991.98px) {
  .product-layout {
    grid-template-columns: 1fr;
  }

  .product-gallery {
    position: static;
  }
}

@media (max-width: 575.98px) {
  .product-details__buttons {
    flex-direction: column;
  }

  .product-details__buttons :deep(.btn) {
    width: 100%;
  }

  .review-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .review-card__rating {
    align-self: flex-start;
  }

  .review-card__stars {
    letter-spacing: 0.12em;
  }
}
</style>

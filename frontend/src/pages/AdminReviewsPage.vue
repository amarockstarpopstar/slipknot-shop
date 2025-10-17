<template>
  <section class="section fade-in-up">
    <div class="layout-container admin-page">
      <header class="admin-header">
        <div>
          <span class="chip mb-2">Администрирование</span>
          <h1 class="section-title mb-1">Модерация отзывов</h1>
          <p class="section-subtitle mb-0">Проверяйте отзывы покупателей и управляйте статусами публикации.</p>
        </div>
      </header>

      <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

      <LoadingSpinner v-if="initialLoading" />

      <div v-else class="admin-panel">
        <div class="admin-panel__toolbar">
          <h2 class="admin-panel__title">Отзывы покупателей</h2>
          <div class="admin-panel__actions gap-2">
            <select
              v-model="selectedStatus"
              class="form-select"
              style="max-width: 220px"
              :disabled="reloading"
            >
              <option value="all">Все статусы</option>
              <option value="pending">На модерации</option>
              <option value="approved">Опубликованные</option>
              <option value="rejected">Отклонённые</option>
            </select>
            <button class="btn btn-outline-secondary" type="button" @click="reload" :disabled="reloading">
              Обновить
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0 admin-table">
            <colgroup>
              <col style="width: 4rem" />
              <col style="width: 14rem" />
              <col style="width: 12rem" />
              <col style="width: 10rem" />
              <col style="width: 11rem" />
              <col />
              <col style="width: 10rem" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Товар</th>
                <th scope="col">Покупатель</th>
                <th scope="col">Оценка</th>
                <th scope="col">Статус</th>
                <th scope="col">Комментарий</th>
                <th scope="col" class="text-end">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="review in reviews" :key="review.id">
                <th scope="row">{{ review.id }}</th>
                <td>
                  <div class="fw-semibold">{{ review.product.title }}</div>
                  <div class="text-muted small">Артикул: {{ review.product.sku }}</div>
                </td>
                <td>
                  <div class="fw-semibold">{{ review.author.name }}</div>
                  <div class="text-muted small">{{ review.author.email }}</div>
                </td>
                <td>
                  <div class="fw-semibold">{{ review.rating }} / 5</div>
                  <div class="text-warning">{{ formatRating(review.rating) }}</div>
                </td>
                <td>
                  <span class="badge bg-dark text-uppercase">{{ formatStatus(review.status) }}</span>
                  <div class="text-muted small mt-1">{{ formatDate(review.updatedAt) }}</div>
                </td>
                <td class="text-break">
                  <span v-if="review.comment && review.comment.length">{{ review.comment }}</span>
                  <span v-else class="text-muted">Без комментария</span>
                </td>
                <td class="text-end admin-table__actions">
                  <button
                    v-if="review.status !== 'approved'"
                    class="btn btn-sm btn-success"
                    type="button"
                    @click="approveReview(review.id)"
                    :disabled="actionLoading === review.id"
                  >
                    <span
                      v-if="actionLoading === review.id && approving"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Одобрить
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    type="button"
                    @click="deleteReview(review.id)"
                    :disabled="actionLoading === review.id"
                  >
                    <span
                      v-if="actionLoading === review.id && deleting"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Удалить
                  </button>
                </td>
              </tr>
              <tr v-if="!reviews.length">
                <td colspan="7" class="text-center text-muted py-4">Отзывы не найдены</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { useReviewsStore } from '../store/reviewsStore';

const reviewsStore = useReviewsStore();
const { moderationReviews, moderationLoading, moderationError } = storeToRefs(reviewsStore);

const selectedStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending');
const initialLoading = ref(true);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const actionLoading = ref<number | null>(null);
const approving = ref(false);
const deleting = ref(false);

const reviews = computed(() => moderationReviews.value);
const reloading = computed(() => moderationLoading.value);

const formatStatus = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'Опубликован';
    case 'rejected':
      return 'Отклонён';
    case 'pending':
    default:
      return 'На модерации';
  }
};

const formatRating = (rating: number): string => {
  const filled = '★'.repeat(Math.max(0, Math.min(5, Math.round(rating))));
  return `${filled.padEnd(5, '☆')}`;
};

const formatDate = (value: string): string => {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    console.warn('Failed to format review date', error);
    return value;
  }
};

const loadReviews = async () => {
  errorMessage.value = null;
  const filter = selectedStatus.value === 'all' ? undefined : selectedStatus.value;
  const result = await reviewsStore.loadModeration(filter);
  if (!result) {
    errorMessage.value = moderationError.value ?? 'Не удалось загрузить отзывы';
  }
};

const reload = async () => {
  await loadReviews();
  if (!errorMessage.value) {
    successMessage.value = 'Список отзывов обновлён';
    window.setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
};

const approveReview = async (reviewId: number) => {
  if (actionLoading.value) {
    return;
  }
  actionLoading.value = reviewId;
  approving.value = true;
  successMessage.value = null;
  errorMessage.value = null;
  try {
    await reviewsStore.approveReview(reviewId);
    successMessage.value = 'Отзыв одобрен и опубликован';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось одобрить отзыв';
    errorMessage.value = message;
  } finally {
    approving.value = false;
    actionLoading.value = null;
    window.setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
};

const deleteReview = async (reviewId: number) => {
  if (actionLoading.value) {
    return;
  }
  const confirmed = window.confirm('Удалить отзыв? Действие необратимо.');
  if (!confirmed) {
    return;
  }
  actionLoading.value = reviewId;
  deleting.value = true;
  successMessage.value = null;
  errorMessage.value = null;
  try {
    await reviewsStore.deleteReview(reviewId);
    successMessage.value = 'Отзыв удалён';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось удалить отзыв';
    errorMessage.value = message;
  } finally {
    deleting.value = false;
    actionLoading.value = null;
    window.setTimeout(() => {
      successMessage.value = null;
    }, 4000);
  }
};

watch(selectedStatus, async () => {
  await loadReviews();
});

onMounted(async () => {
  await loadReviews();
  initialLoading.value = false;
});
</script>

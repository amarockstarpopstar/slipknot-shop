import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  approveReview as approveReviewApi,
  checkReviewEligibility,
  createReview,
  deleteReview as deleteReviewApi,
  fetchProductReviews,
  fetchReviewsForModeration,
  type CreateReviewPayload,
  type ReviewEligibilityResponse,
  type ReviewModerationResponseDto,
  type ReviewResponseDto,
} from '../api/reviews';
import { extractErrorMessage } from '../api/http';

interface ReviewsByProductState {
  [productId: number]: ReviewResponseDto[];
}

interface ReviewEligibilityState {
  [productId: number]: ReviewEligibilityResponse | undefined;
}

export const useReviewsStore = defineStore('reviews', () => {
  const reviewsByProduct = ref<ReviewsByProductState>({});
  const productLoading = ref(false);
  const productError = ref<string | null>(null);

  const eligibilityByProduct = ref<ReviewEligibilityState>({});
  const eligibilityLoading = ref(false);
  const eligibilityError = ref<string | null>(null);

  const moderationReviews = ref<ReviewModerationResponseDto[]>([]);
  const moderationLoading = ref(false);
  const moderationError = ref<string | null>(null);

  const setReviewsForProduct = (
    productId: number,
    reviews: ReviewResponseDto[],
  ) => {
    reviewsByProduct.value = {
      ...reviewsByProduct.value,
      [productId]: reviews,
    };
  };

  const removeEligibilityForProduct = (productId: number) => {
    const nextState = { ...eligibilityByProduct.value };
    delete nextState[productId];
    eligibilityByProduct.value = nextState;
    eligibilityError.value = null;
  };

  const loadProductReviews = async (
    productId: number,
  ): Promise<ReviewResponseDto[] | null> => {
    try {
      productLoading.value = true;
      const reviews = await fetchProductReviews(productId);
      setReviewsForProduct(productId, reviews);
      productError.value = null;
      return reviews;
    } catch (error) {
      productError.value = extractErrorMessage(error);
      return null;
    } finally {
      productLoading.value = false;
    }
  };

  const checkEligibility = async (
    productId: number,
  ): Promise<ReviewEligibilityResponse | null> => {
    try {
      eligibilityLoading.value = true;
      const eligibility = await checkReviewEligibility(productId);
      eligibilityByProduct.value = {
        ...eligibilityByProduct.value,
        [productId]: eligibility,
      };
      eligibilityError.value = null;
      return eligibility;
    } catch (error) {
      eligibilityError.value = extractErrorMessage(error);
      return null;
    } finally {
      eligibilityLoading.value = false;
    }
  };

  const submitReview = async (
    payload: CreateReviewPayload,
  ): Promise<ReviewResponseDto> => {
    try {
      const review = await createReview(payload);
      // после отправки отзыв появится в списке после одобрения, поэтому просто инвалидация
      await loadProductReviews(payload.productId);
      eligibilityByProduct.value = {
        ...eligibilityByProduct.value,
        [payload.productId]: {
          canReview: false,
          hasPurchased: true,
          alreadyReviewed: true,
        },
      };
      return review;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  };

  const loadModeration = async (
    status?: string,
  ): Promise<ReviewModerationResponseDto[] | null> => {
    try {
      moderationLoading.value = true;
      const reviews = await fetchReviewsForModeration(status);
      moderationReviews.value = reviews;
      moderationError.value = null;
      return reviews;
    } catch (error) {
      moderationError.value = extractErrorMessage(error);
      return null;
    } finally {
      moderationLoading.value = false;
    }
  };

  const approveReview = async (reviewId: number): Promise<void> => {
    try {
      const updated = await approveReviewApi(reviewId);
      moderationReviews.value = moderationReviews.value.map((review) =>
        review.id === reviewId
          ? { ...review, status: updated.status, updatedAt: updated.updatedAt }
          : review,
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  };

  const deleteReview = async (reviewId: number): Promise<void> => {
    try {
      await deleteReviewApi(reviewId);
      moderationReviews.value = moderationReviews.value.filter(
        (review) => review.id !== reviewId,
      );
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  };

  const reviewsCount = computed(() =>
    Object.values(reviewsByProduct.value).reduce(
      (total, reviews) => total + reviews.length,
      0,
    ),
  );

  return {
    reviewsByProduct,
    productLoading,
    productError,
    eligibilityByProduct,
    eligibilityLoading,
    eligibilityError,
    moderationReviews,
    moderationLoading,
    moderationError,
    reviewsCount,
    loadProductReviews,
    checkEligibility,
    submitReview,
    loadModeration,
    approveReview,
    deleteReview,
    removeEligibilityForProduct,
  };
});

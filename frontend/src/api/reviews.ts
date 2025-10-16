import { http } from './http';

export interface ReviewAuthorDto {
  id: number;
  name: string;
}

export interface ReviewResponseDto {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  productId: number;
  author: ReviewAuthorDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  productId: number;
  rating: number;
  comment?: string | null;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  hasPurchased: boolean;
  alreadyReviewed: boolean;
}

export interface ReviewModerationAuthorDto extends ReviewAuthorDto {
  email: string;
}

export interface ReviewModerationProductDto {
  id: number;
  title: string;
  sku: string;
}

export interface ReviewModerationResponseDto {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  product: ReviewModerationProductDto;
  author: ReviewModerationAuthorDto;
  createdAt: string;
  updatedAt: string;
}

export const fetchProductReviews = async (
  productId: number,
): Promise<ReviewResponseDto[]> => {
  const { data } = await http.get<ReviewResponseDto[]>(`/reviews/${productId}`);
  return data;
};

export const checkReviewEligibility = async (
  productId: number,
): Promise<ReviewEligibilityResponse> => {
  const { data } = await http.get<ReviewEligibilityResponse>(
    `/reviews/${productId}/eligibility`,
  );
  return data;
};

export const createReview = async (
  payload: CreateReviewPayload,
): Promise<ReviewResponseDto> => {
  const { data } = await http.post<ReviewResponseDto>('/reviews', payload);
  return data;
};

export const fetchReviewsForModeration = async (
  status?: string,
): Promise<ReviewModerationResponseDto[]> => {
  const params = status ? { status } : undefined;
  const { data } = await http.get<ReviewModerationResponseDto[]>('/reviews', {
    params,
  });
  return data;
};

export const approveReview = async (
  reviewId: number,
): Promise<ReviewResponseDto> => {
  const { data } = await http.patch<ReviewResponseDto>(
    `/reviews/${reviewId}/approve`,
    {},
  );
  return data;
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  await http.delete(`/reviews/${reviewId}`);
};

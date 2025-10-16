import { ApiProperty } from '@nestjs/swagger';

// dto representing review eligibility information for current user
export class ReviewEligibilityResponseDto {
  @ApiProperty({
    example: true,
    description: 'Может ли пользователь оставить отзыв',
  })
  canReview: boolean;

  @ApiProperty({
    example: true,
    description: 'Совершал ли пользователь покупку товара',
  })
  hasPurchased: boolean;

  @ApiProperty({
    example: false,
    description: 'Оставлял ли пользователь отзыв ранее',
  })
  alreadyReviewed: boolean;
}

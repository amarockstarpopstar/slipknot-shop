import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewEligibilityResponseDto } from './dto/review-eligibility-response.dto';
import { ReviewModerationResponseDto } from './dto/review-moderation-response.dto';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';

const CANCELLED_STATUS_NAME = 'Отменен';

// service implementing review creation and retrieval logic
@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(
    userId: number,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const product = await this.productsRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const hasPurchased = await this.hasUserPurchasedProduct(
      userId,
      dto.productId,
    );

    if (!hasPurchased) {
      throw new ForbiddenException(
        'Оставить отзыв можно только после покупки данного товара',
      );
    }

    const comment = dto.comment?.trim();

    const review = this.reviewsRepository.create({
      user,
      product,
      rating: dto.rating,
      comment: comment && comment.length ? comment : null,
      status: 'pending',
    });

    try {
      const saved = await this.reviewsRepository.save(review);
      const loaded = await this.reviewsRepository.findOne({
        where: { id: saved.id },
        relations: { user: true, product: true },
      });

      if (!loaded) {
        throw new NotFoundException('Не удалось загрузить созданный отзыв');
      }

      return this.toReviewResponse(loaded);
    } catch (error) {
      const driverError =
        error instanceof QueryFailedError
          ? error.driverError
          : (error as { driverError?: { code?: string } }).driverError;

      if (driverError?.code === '23505') {
        throw new ConflictException('Вы уже оставили отзыв на данный товар');
      }

      throw error;
    }
  }

  async findForProduct(productId: number): Promise<ReviewResponseDto[]> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const reviews = await this.reviewsRepository.find({
      where: { product: { id: productId }, status: 'approved' },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    return reviews.map((review) => this.toReviewResponse(review, productId));
  }

  async getEligibility(
    userId: number,
    productId: number,
  ): Promise<ReviewEligibilityResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    const [hasPurchased, existingReview] = await Promise.all([
      this.hasUserPurchasedProduct(userId, productId),
      this.reviewsRepository.findOne({
        where: { user: { id: userId }, product: { id: productId } },
      }),
    ]);

    return {
      canReview: hasPurchased && !existingReview,
      hasPurchased,
      alreadyReviewed: Boolean(existingReview),
    };
  }

  async findAll(status?: string): Promise<ReviewModerationResponseDto[]> {
    const normalizedStatus = status?.toLowerCase();
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    const qb = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC');

    if (normalizedStatus && allowedStatuses.includes(normalizedStatus)) {
      qb.where('review.status = :status', { status: normalizedStatus });
    }

    const reviews = await qb.getMany();

    return reviews.map((review) => this.toModerationResponse(review));
  }

  async approve(reviewId: number): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: { user: true, product: true },
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    if (review.status === 'approved') {
      return this.toReviewResponse(review);
    }

    review.status = 'approved';

    await this.reviewsRepository.save(review);

    const updated = await this.reviewsRepository.findOne({
      where: { id: reviewId },
      relations: { user: true, product: true },
    });

    if (!updated) {
      throw new NotFoundException('Не удалось обновить статус отзыва');
    }

    return this.toReviewResponse(updated);
  }

  async remove(reviewId: number): Promise<void> {
    const result = await this.reviewsRepository.delete({ id: reviewId });

    if (!result.affected) {
      throw new NotFoundException('Отзыв не найден');
    }
  }

  private toReviewResponse(
    review: Review,
    productId?: number,
  ): ReviewResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? null,
      status: review.status,
      productId: productId ?? review.product?.id ?? 0,
      author: {
        id: review.user?.id ?? 0,
        name: review.user?.name ?? 'Неизвестный пользователь',
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private toModerationResponse(review: Review): ReviewModerationResponseDto {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? null,
      status: review.status,
      product: {
        id: review.product?.id ?? 0,
        title: review.product?.title ?? 'Неизвестный товар',
        sku: review.product?.sku ?? '—',
      },
      author: {
        id: review.user?.id ?? 0,
        name: review.user?.name ?? 'Неизвестный пользователь',
        email: review.user?.email ?? '—',
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }

  private async hasUserPurchasedProduct(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    return this.ordersRepository
      .createQueryBuilder('orderEntity')
      .innerJoin('orderEntity.items', 'item')
      .innerJoin('orderEntity.status', 'status')
      .where('orderEntity.user_id = :userId', { userId })
      .andWhere('item.product_id = :productId', { productId })
      .andWhere('status.name <> :cancelled', {
        cancelled: CANCELLED_STATUS_NAME,
      })
      .getExists();
  }
}

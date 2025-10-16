import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

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
}

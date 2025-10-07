import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from './entities/order-status.entity';
import { OrderStatusResponseDto } from './dto/order-status-response.dto';

// service exposing read operations for order statuses
@Injectable()
export class OrderStatusesService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly statusesRepository: Repository<OrderStatus>,
  ) {}

  async findAll(): Promise<OrderStatusResponseDto[]> {
    const statuses = await this.statusesRepository.find({ order: { id: 'ASC' } });

    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
    }));
  }
}

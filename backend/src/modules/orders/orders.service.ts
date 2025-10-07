import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';

// service handling admin order management logic
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly statusesRepository: Repository<OrderStatus>,
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      relations: {
        user: true,
        status: true,
        address: true,
        items: { product: true },
      },
      order: { id: 'ASC' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async findById(id: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        status: true,
        address: true,
        items: { product: true },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return this.toOrderResponse(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    if (updateOrderDto.statusId !== undefined) {
      if (!order.status || order.status.id !== updateOrderDto.statusId) {
        order.status = await this.findStatusById(updateOrderDto.statusId);
      }
    }

    if (updateOrderDto.totalAmount !== undefined) {
      order.totalAmount = updateOrderDto.totalAmount.toFixed(2);
    }

    if (updateOrderDto.paymentMethod !== undefined) {
      const paymentMethod = updateOrderDto.paymentMethod.trim();
      order.paymentMethod = paymentMethod.length ? paymentMethod : null;
    }

    if (updateOrderDto.comment !== undefined) {
      const comment = updateOrderDto.comment.trim();
      order.comment = comment.length ? comment : null;
    }

    await this.ordersRepository.save(order);

    return this.findById(order.id);
  }

  async remove(id: number): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    await this.ordersRepository.remove(order);
  }

  private async findStatusById(id: number): Promise<OrderStatus> {
    const status = await this.statusesRepository.findOne({ where: { id } });

    if (!status) {
      throw new NotFoundException('Статус заказа не найден');
    }

    return status;
  }

  private toOrderResponse(order: Order): OrderResponseDto {
    const items: OrderItemResponseDto[] = (order.items ?? []).map((item) => ({
      id: item.id,
      product: {
        id: item.product?.id ?? 0,
        title: item.product?.title ?? 'Товар удален',
        sku: item.product?.sku ?? '—',
      },
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));

    return {
      id: order.id,
      customer: {
        id: order.user?.id ?? 0,
        name: order.user?.name ?? 'Неизвестный покупатель',
        email: order.user?.email ?? '—',
      },
      status: {
        id: order.status?.id ?? 0,
        name: order.status?.name ?? 'Без статуса',
      },
      totalAmount: Number(order.totalAmount),
      paymentMethod: order.paymentMethod ?? null,
      comment: order.comment ?? null,
      address: order.address
        ? {
            id: order.address.id,
            city: order.address.city,
            street: order.address.street,
            postalCode: order.address.postalCode,
            comment: order.address.comment ?? null,
          }
        : null,
      items,
      placedAt: order.placedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

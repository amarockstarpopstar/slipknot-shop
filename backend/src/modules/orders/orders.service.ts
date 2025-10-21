import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../order-statuses/entities/order-status.entity';
import { DEFAULT_SHIPPING_STATUS } from './orders.constants';
import { CustomerOrderResponseDto } from './dto/customer-order-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCustomerDto } from './dto/order-customer.dto';
import { User } from '../users/entities/user.entity';
import { UserAddress } from '../user-addresses/entities/user-address.entity';

// service handling manager order management logic
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatus)
    private readonly statusesRepository: Repository<OrderStatus>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserAddress)
    private readonly addressesRepository: Repository<UserAddress>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const user = await this.findUserById(createOrderDto.userId);
    const status = await this.findStatusById(createOrderDto.statusId);

    let address: UserAddress | null = null;
    if (createOrderDto.addressId !== undefined) {
      address = await this.findAddressById(createOrderDto.addressId);
    }

    const shippingStatus = (
      createOrderDto.shippingStatus?.trim() || DEFAULT_SHIPPING_STATUS
    ).slice(0, 120);
    const paymentMethod = createOrderDto.paymentMethod?.trim() || null;
    const comment = createOrderDto.comment?.trim() || null;

    const order = this.ordersRepository.create({
      user,
      status,
      address,
      totalAmount: createOrderDto.totalAmount.toFixed(2),
      paymentMethod,
      comment,
      shippingStatus,
      shippingUpdatedAt: new Date(),
    });

    const saved = await this.ordersRepository.save(order);
    return this.findById(saved.id);
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      relations: {
        user: true,
        status: true,
        address: true,
        items: { product: true, productSize: true },
      },
      order: { id: 'ASC' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async findCustomers(): Promise<OrderCustomerDto[]> {
    const users = await this.usersRepository.find({
      select: {
        id: true,
        name: true,
        email: true,
      },
      order: { name: 'ASC' },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  async findById(id: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        user: true,
        status: true,
        address: true,
        items: { product: true, productSize: true },
      },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return this.toOrderResponse(order);
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
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

    if (updateOrderDto.shippingStatus !== undefined) {
      const shippingStatus = updateOrderDto.shippingStatus.trim();
      const normalizedStatus = shippingStatus.length
        ? shippingStatus
        : DEFAULT_SHIPPING_STATUS;
      if (order.shippingStatus !== normalizedStatus) {
        order.shippingStatus = normalizedStatus;
        order.shippingUpdatedAt = new Date();
      }
    }

    await this.ordersRepository.save(order);

    return this.findById(order.id);
  }

  async findForUser(userId: number): Promise<CustomerOrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: { status: true, items: { product: true, productSize: true } },
      order: { placedAt: 'DESC', id: 'DESC' },
    });

    return orders.map((order) => this.toCustomerOrderResponse(order));
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

  private async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  private async findAddressById(id: number): Promise<UserAddress> {
    const address = await this.addressesRepository.findOne({ where: { id } });

    if (!address) {
      throw new NotFoundException('Адрес доставки не найден');
    }

    return address;
  }

  private mapOrderItems(order: Order): OrderItemResponseDto[] {
    return (order.items ?? []).map((item) => ({
      id: item.id,
      product: {
        id: item.product?.id ?? 0,
        title: item.product?.title ?? 'Товар удален',
        sku: item.product?.sku ?? '—',
      },
      size: item.productSize
        ? {
            id: item.productSize.id,
            size: item.productSize.size,
          }
        : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    }));
  }

  private toOrderResponse(order: Order): OrderResponseDto {
    const items = this.mapOrderItems(order);

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
      shippingStatus: order.shippingStatus,
      shippingUpdatedAt: order.shippingUpdatedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toCustomerOrderResponse(order: Order): CustomerOrderResponseDto {
    const items = this.mapOrderItems(order);

    return {
      id: order.id,
      totalAmount: Number(order.totalAmount),
      status: {
        id: order.status?.id ?? 0,
        name: order.status?.name ?? 'Без статуса',
      },
      paymentMethod: order.paymentMethod ?? null,
      shippingStatus: order.shippingStatus,
      shippingUpdatedAt: order.shippingUpdatedAt,
      placedAt: order.placedAt,
      items,
    };
  }
}

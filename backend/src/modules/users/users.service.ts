import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserResponseDto } from './dto/user-response.dto';

// service with user management logic
@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const role = await this.resolveRole(createUserDto.roleName);

    const passwordHash = await bcrypt.hash(createUserDto.password, this.saltRounds);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      phone: createUserDto.phone,
      role,
    });

    const saved = await this.usersRepository.save(user);
    return this.findById(saved.id);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      relations: { role: true },
      order: { id: 'ASC' },
    });
    return users.map((user) => this.toUserResponse(user));
  }

  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.toUserResponse(user);
  }

  async findEntityById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { role: true },
    });
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async updateRole(
    userId: number,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.findEntityById(userId);
    const role = await this.resolveRole(updateUserRoleDto.roleName);

    user.role = role;
    const saved = await this.usersRepository.save(user);
    return this.findById(saved.id);
  }

  private async resolveRole(roleName?: string): Promise<Role> {
    const finalRoleName = roleName?.trim() || 'Покупатель';

    const role = await this.rolesRepository.findOne({
      where: { name: finalRoleName },
    });

    if (!role) {
      throw new BadRequestException('Указанная роль не найдена');
    }

    return role;
  }

  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role ? user.role.name : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

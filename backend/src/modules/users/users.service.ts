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
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto, UserRoleDto } from './dto/user-response.dto';

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

    const roleName = createUserDto.roleName?.trim() || 'Покупатель';
    const role = await this.resolveRole(roleName);

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

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findEntityById(userId);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
    }

    if (typeof updateUserDto.name === 'string') {
      user.name = updateUserDto.name;
    }

    if (typeof updateUserDto.email === 'string') {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.phone !== undefined) {
      const normalizedPhone = updateUserDto.phone?.trim();
      user.phone = normalizedPhone ? normalizedPhone : null;
    }

    if (updateUserDto.roleName) {
      user.role = await this.resolveRole(updateUserDto.roleName);
    }

    const saved = await this.usersRepository.save(user);
    return this.findById(saved.id);
  }

  async remove(userId: number): Promise<void> {
    const user = await this.findEntityById(userId);
    await this.usersRepository.remove(user);
  }

  async findAllRoles(): Promise<UserRoleDto[]> {
    const roles = await this.rolesRepository.find({
      order: { name: 'ASC' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
    }));
  }

  private async resolveRole(roleName: string): Promise<Role> {
    const normalizedRole = roleName.trim();

    if (!normalizedRole) {
      throw new BadRequestException('Указанная роль не найдена');
    }

    const role = await this.rolesRepository.findOne({
      where: { name: normalizedRole },
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
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

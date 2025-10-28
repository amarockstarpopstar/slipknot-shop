import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';

// service with authentication logic
@Injectable()
export class AuthService {
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.accessExpiresIn = configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    this.refreshExpiresIn = configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    this.accessSecret = configService.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret';
    this.refreshSecret = configService.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh-secret';
  }

  async register(createUserDto: CreateUserDto) {
    this.logger.log(`Регистрация пользователя с email ${createUserDto.email}`);
    try {
      const createdUser = await this.usersService.create(createUserDto);
      const user = await this.usersService.findEntityById(createdUser.id);
      this.logger.log(`Пользователь ${user.email} успешно зарегистрирован`);
      return this.buildAuthResponse(user, 'Регистрация прошла успешно');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Ошибка при регистрации пользователя ${createUserDto.email}: ${message}`, stack);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Попытка входа пользователя ${loginDto.email}`);
    try {
      const user = await this.usersService.validateCredentials(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        this.logger.warn(`Неудачная попытка входа: ${loginDto.email}`);
        throw new UnauthorizedException('Неверный email или пароль');
      }

      this.logger.log(`Пользователь ${user.email} успешно авторизован`);
      return this.buildAuthResponse(user, 'Вход выполнен успешно');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Ошибка при авторизации ${loginDto.email}: ${message}`, stack);
      throw error;
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Недействительный refresh токен');
      }

      const user = await this.usersService.findEntityById(payload.sub);
      return this.buildAuthResponse(user, 'Токены обновлены');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Ошибка обновления токенов: ${message}`, stack);
      throw new UnauthorizedException('Недействительный refresh токен');
    }
  }

  private async buildAuthResponse(user: User, message: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role ? user.role.name : null,
        type: 'access',
      },
      { secret: this.accessSecret, expiresIn: this.accessExpiresIn },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role ? user.role.name : null,
        type: 'refresh',
      },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
    );

    const safeUser: UserResponseDto = this.usersService.toUserResponse(user);

    return {
      message,
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }
}

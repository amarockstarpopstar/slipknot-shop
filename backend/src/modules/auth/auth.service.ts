import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const createdUser = await this.usersService.create(createUserDto);
    const user = await this.usersService.findEntityById(createdUser.id);
    return this.buildAuthResponse(user, 'Регистрация прошла успешно');
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.buildAuthResponse(user, 'Вход выполнен успешно');
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

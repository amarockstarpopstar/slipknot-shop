import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

// dto describing authentication response with tokens
export class AuthResponseDto {
  @ApiProperty({ example: 'Вход выполнен успешно', description: 'Сообщение для пользователя' })
  message: string;

  @ApiProperty({ description: 'JWT access токен' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh токен' })
  refreshToken: string;

  @ApiProperty({ type: () => UserResponseDto, description: 'Данные аутентифицированного пользователя' })
  user: UserResponseDto;
}

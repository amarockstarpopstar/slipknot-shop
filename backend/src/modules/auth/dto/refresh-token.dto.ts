import { IsNotEmpty, IsString } from 'class-validator';

// dto for refresh token request
export class RefreshTokenDto {
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Токен не может быть пустым' })
  refreshToken: string;
}

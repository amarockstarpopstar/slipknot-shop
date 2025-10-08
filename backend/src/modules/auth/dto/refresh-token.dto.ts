import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// dto for refresh token request
export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh токен', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Токен не может быть пустым' })
  refreshToken: string;
}

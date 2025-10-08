import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// dto for returning user without sensitive fields
export class UserRoleDto {
  @ApiProperty({ example: 1, description: 'Идентификатор роли' })
  id: number;

  @ApiProperty({ example: 'Администратор', description: 'Название роли' })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 42, description: 'Идентификатор пользователя' })
  id: number;

  @ApiProperty({ example: 'Кори Тейлор', description: 'Имя и фамилия пользователя' })
  name: string;

  @ApiProperty({ example: 'corey@slipknot.com', description: 'Электронная почта' })
  email: string;

  @ApiPropertyOptional({ example: '+7 (900) 123-45-67', description: 'Номер телефона' })
  phone?: string | null;

  @ApiProperty({ type: () => UserRoleDto, nullable: true, description: 'Роль пользователя' })
  role: UserRoleDto | null;

  @ApiProperty({ description: 'Дата создания записи' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;
}

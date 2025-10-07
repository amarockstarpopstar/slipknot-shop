import { IsNotEmpty, IsString } from 'class-validator';

// dto for updating user role
export class UpdateUserRoleDto {
  @IsString({ message: 'Роль должна быть строкой' })
  @IsNotEmpty({ message: 'Роль не может быть пустой' })
  roleName: string;
}

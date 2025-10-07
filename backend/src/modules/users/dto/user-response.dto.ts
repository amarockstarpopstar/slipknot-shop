// dto for returning user without sensitive fields
export class UserRoleDto {
  id: number;
  name: string;
}

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRoleDto | null;
  createdAt: Date;
  updatedAt: Date;
}

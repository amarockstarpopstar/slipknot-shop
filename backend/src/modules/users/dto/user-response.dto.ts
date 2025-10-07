// dto for returning user without sensitive fields
export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
}

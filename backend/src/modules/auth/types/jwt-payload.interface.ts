// payload stored inside JWT tokens
export interface JwtPayload {
  sub: number;
  email: string;
  role: string | null;
  type?: 'access' | 'refresh';
}

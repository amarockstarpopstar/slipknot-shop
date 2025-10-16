import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

// guard for cart routes with custom unauthorized message
@Injectable()
export class CartAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: unknown, user: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Авторизуйтесь, чтобы добавить товар в корзину',
      );
    }
    return user;
  }
}

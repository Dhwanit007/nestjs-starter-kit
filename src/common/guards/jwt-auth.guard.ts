import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   For debugging purposes
  // handleRequest(err, user, info, context) {
  //   console.log('JwtAuthGuard -> err:', err);
  //   console.log('JwtAuthGuard -> user:', user);
  //   console.log('JwtAuthGuard -> info:', info);
  //   return super.handleRequest(err, user, info, context);
  // }
}

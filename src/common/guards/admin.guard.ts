import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from 'src/modules/employee/entities/employee.entity';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log(request.user.role);

    if (!user) {
      throw new ForbiddenException('Login first to access');
    }

    if (user.role !== Role.Admin) {
      // console.log(user.role)
      // console.log(Role.Admin)
      throw new ForbiddenException('Admin access only');
    }

    return true;
  }
}

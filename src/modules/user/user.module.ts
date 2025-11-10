import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ApiUserController } from './controllers/Api/api-user.controller';
import { UserController } from './controllers/Web/user.controller';

@Module({
  providers: [UserService],
  controllers: [ApiUserController, UserController],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}

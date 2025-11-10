import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User2 } from './user2.entity';
import { User2ApiController } from './controllers/api/user2-api.controller';
import { User2WebController } from './controllers/web/user2-web.controller';
import { User2Service } from './user2.service';

@Module({
  providers: [User2Service],
  exports: [],
  imports: [TypeOrmModule.forFeature([User2])],
  controllers: [User2ApiController, User2WebController],
})
export class User2Module {}

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../../data-source';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../../config/database.config';
import passportConfig from '../../config/passport.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { User2Module } from '../user2/user2.module';

import { APP_PIPE } from '@nestjs/core';
import { ViewLocalsMiddleware } from 'src/common/middlewares/view-locals.middleware';
import { CustomValidationPipe } from 'src/common/pipes/validation.pipe';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/', // This serves files from the root path
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, passportConfig],
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    UserModule,
    User2Module,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ViewLocalsMiddleware)
      .exclude('api/(.*)', 'assets/(.*)')
      .forRoutes('*');
  }
}

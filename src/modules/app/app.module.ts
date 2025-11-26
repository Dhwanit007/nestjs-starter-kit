import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ViewLocalsMiddleware } from 'src/common/middlewares/view-locals.middleware';
import { CustomValidationPipe } from 'src/common/pipes/validation.pipe';

import databaseConfig from '../../config/database.config';
import passportConfig from '../../config/passport.config';
import { AppDataSource } from '../../data-source';
import { AuthModule } from '../auth/auth.module';
import { DepartmentsModule } from '../departments/departments.module';
import { EmployeeModule } from '../employee/employee.module';
import { ProjectsModule } from '../projects/projects.module';
import { TodosModule } from '../todos/todos.module';
// import { ChatsModule } from '../chat/chats.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    TodosModule,
    ProjectsModule,
    EmployeeModule,
    DepartmentsModule,
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

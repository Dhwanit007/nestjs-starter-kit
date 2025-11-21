/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as flash from 'connect-flash';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as i18n from 'i18n-express';
import * as methodOverride from 'method-override';
import { join } from 'path';
// adjust path as needed
import { Logger } from 'winston';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ViewLocalsMiddleware } from './common/middlewares/view-locals.middleware';
import { AppModule } from './modules/app/app.module';
import { TodosService } from './modules/todos/todos.service';
import { log } from './utils/logger';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fileUpload = require('express-fileupload');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const expressLayouts = require('express-ejs-layouts');
declare global {
  // Add this to make log available everywhere
  var log: Logger;
}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(methodOverride('_method'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const todosService = app.get(TodosService);

  app.use((req, res, next) => {
    res.locals.todos = todosService.findAll();
    next();
  });

  // Set up view engine
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.set('layout', 'layouts/layout');
  app.use(expressLayouts);
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    session({
      secret: 'nodedemo',
      resave: false,
      saveUninitialized: true,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(flash());

  app.use(new ViewLocalsMiddleware().use);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (global as any).log = log;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(fileUpload());
  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    i18n({
      translationsPath: join(__dirname, '..', 'i18n'),
      siteLangs: ['ar', 'ch', 'en', 'fr', 'ru', 'it', 'gr', 'sp'],
      textsVarName: 'translation',
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 9000);
}
void bootstrap();

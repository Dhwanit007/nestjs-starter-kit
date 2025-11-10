import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './modules/user/user.entity';
import { User2 } from './modules/user2/user2.entity';
import * as dotenv from 'dotenv';
import { OAuthAccessToken } from './modules/oauth-access-token/oauth-access-token.entity';

// we can't access configService directly here because this file is loaded before the AppModule
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, //configService.get<boolean>('database.synchronize', false),
  entities: [User, OAuthAccessToken, User2],
  migrations: [__dirname + '/database/migrations/*.ts'],
  // logging: true,
  // logging: 'all', //for sql queries logging
});

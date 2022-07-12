import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModelsModule } from './models/models.module';
import { AccountsModule } from './accounts/accounts.module';
import * as dotenv from 'dotenv';

const NODE_ENV = process.env.NODE_ENV;

dotenv.config({ path: NODE_ENV === 'test' ? 'test.env' : '.env' });

// Database
const { DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const DB = MongooseModule.forRoot(
  `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.5wlav.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
);

@Module({
  imports: [DB, ModelsModule, AuthModule, UsersModule, AccountsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

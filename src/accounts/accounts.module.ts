import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from '../models/account.model';
import { HistorySchema } from '../models/history.model';
import { ModelsModule } from '../models/models.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    ModelsModule,
    MongooseModule.forFeature([{ name: 'Accounts', schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: 'History', schema: HistorySchema }]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}

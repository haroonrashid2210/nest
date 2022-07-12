import {
  Body,
  Controller,
  UseGuards,
  Put,
  Get,
  Query,
  Post,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserInterface } from '../models/user.model';
import { AccountsService } from './accounts.service';
import * as AccountsDTO from './accounts.dto';

@UseGuards(JwtGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post('create')
  create(@GetUser() user: UserInterface, @Body() body: AccountsDTO.Create) {
    return this.accountsService.create(user, body);
  }

  @Put('deposit-amount')
  deposit(@GetUser() user: UserInterface, @Body() body: AccountsDTO.Deposit) {
    return this.accountsService.deposit(user, body);
  }

  @Put('withdraw-amount')
  withdraw(@GetUser() user: UserInterface, @Body() body: AccountsDTO.Withdraw) {
    return this.accountsService.withdraw(user, body);
  }

  @Put('transfer-amount')
  transfer(@GetUser() user: UserInterface, @Body() body: AccountsDTO.Transfer) {
    return this.accountsService.transfer(user, body);
  }

  @Get('transfer-history')
  history(@GetUser() user: UserInterface, @Query() query: AccountsDTO.History) {
    return this.accountsService.history(user, query);
  }
}

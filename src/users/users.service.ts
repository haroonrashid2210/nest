import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountInterface } from 'src/models/account.model';
import { UserInterface } from 'src/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Accounts')
    private AccountsModel: Model<AccountInterface>,
  ) {}

  async getAccounts(user: UserInterface) {
    const accounts = await this.AccountsModel.find(
      { userId: user._id },
      { accountNumber: 1, _id: 0 },
    );

    return {
      success: 1,
      message: 'Success',
      data: {
        accounts: accounts || [],
      },
    };
  }
}

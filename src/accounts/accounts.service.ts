import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { AccountInterface } from 'src/models/account.model';
import { HistoryInterface } from 'src/models/history.model';
import { UserInterface } from 'src/models/user.model';
import * as AccountsDTO from './accounts.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Accounts')
    private AccountsModel: Model<AccountInterface>,
    @InjectModel('History')
    private HistoryModel: Model<HistoryInterface>,
  ) {}

  async create(user: UserInterface, body: AccountsDTO.Create) {
    const accountNumber = user.cnic + 'ACC' + moment().unix();

    const isAccountCreated = await new this.AccountsModel({
      accountNumber,
      balance: body.initialDepositAmount,
      userId: user._id,
    }).save();

    if (!isAccountCreated) {
      return {
        success: 0,
        message: 'Error occured while processing request',
        data: {},
      };
    }

    await new this.HistoryModel({
      account1Id: isAccountCreated._id,
      amount: body.initialDepositAmount,
      type: 1,
    }).save();

    return {
      success: 1,
      message: 'Account created successfully',
      data: {
        accountNumber,
        balance: body.initialDepositAmount,
      },
    };
  }

  async deposit(user: UserInterface, body: AccountsDTO.Deposit): Promise<any> {
    const isAccountUpdated = await this.AccountsModel.findOneAndUpdate(
      { userId: user._id, accountNumber: body.accountNumber },
      { $inc: { balance: body.amount } },
      { new: true },
    );

    if (!isAccountUpdated) {
      return {
        success: 0,
        message: 'Error occured while processing request',
        data: {},
      };
    }

    await new this.HistoryModel({
      account1Id: isAccountUpdated._id,
      amount: body.amount,
      type: 1,
    }).save();

    return {
      success: 1,
      message: 'Amount depositted successfully',
      data: {
        balance: isAccountUpdated.balance,
      },
    };
  }

  async withdraw(user: UserInterface, body: AccountsDTO.Withdraw) {
    const accountDetails = await this.AccountsModel.findOne({
      userId: user._id,
      accountNumber: body.accountNumber,
    });

    if (!accountDetails) {
      return {
        success: 0,
        message: 'Account not found',
        data: {},
      };
    }

    if (accountDetails.balance < body.amount) {
      throw new HttpException(
        {
          success: 0,
          message: 'Insufficient balance',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAccountUpdated = await this.AccountsModel.findOneAndUpdate(
      { _id: accountDetails._id, userId: user._id },
      { $inc: { balance: -body.amount } },
      { new: true },
    );

    if (!isAccountUpdated) {
      return {
        success: 0,
        message: 'Error occured while processing request',
        data: {},
      };
    }

    await new this.HistoryModel({
      account1Id: accountDetails._id,
      amount: body.amount,
      type: 2,
    }).save();

    return {
      success: 1,
      message: 'Amount withdrawred successfully',
      data: {
        balance: isAccountUpdated.balance,
      },
    };
  }

  async transfer(user: UserInterface, body: AccountsDTO.Transfer) {
    if (body.accountNumber === body.receiverAccountNumber) {
      throw new HttpException(
        {
          success: 0,
          message: 'Cannot transfer to same account',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const doesBeneficiaryExist = await this.AccountsModel.findOne({
      accountNumber: body.receiverAccountNumber,
    });
    if (!doesBeneficiaryExist) {
      throw new HttpException(
        {
          success: 0,
          message: 'Beneficiary does not exist',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const accountDetails = await this.AccountsModel.findOne({
      userId: user._id,
      accountNumber: body.accountNumber,
    });

    if (!accountDetails) {
      throw new HttpException(
        {
          success: 0,
          message: 'Account not found',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (accountDetails.balance < body.amount) {
      throw new HttpException(
        {
          success: 0,
          message: 'Insufficient balance',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Deducting amount
    const isAccountUpdated = await this.AccountsModel.findOneAndUpdate(
      { accountNumber: body.accountNumber },
      { $inc: { balance: -body.amount } },
      { new: true },
    );

    if (!isAccountUpdated) {
      await this.AccountsModel.updateOne(
        { accountNumber: body.accountNumber },
        { $inc: { balance: body.amount } },
      );

      throw new HttpException(
        {
          success: 0,
          message: 'Error occured while processing request',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Transferring amount
    const isBeneficiaryUpdated = await this.AccountsModel.updateOne(
      { accountNumber: body.receiverAccountNumber },
      { $inc: { balance: body.amount } },
    );

    // If not transferred then returning amount to user
    if (!isBeneficiaryUpdated) {
      await this.AccountsModel.updateOne(
        { accountNumber: body.accountNumber },
        { $inc: { balance: body.amount } },
      );

      throw new HttpException(
        {
          success: 0,
          message: 'Error occured while processing request',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await new this.HistoryModel({
      account1Id: accountDetails._id,
      account2Id: doesBeneficiaryExist._id,
      amount: body.amount,
      type: 3,
    }).save();

    await new this.HistoryModel({
      account1Id: doesBeneficiaryExist._id,
      account2Id: accountDetails._id,
      amount: body.amount,
      type: 4,
    }).save();

    return {
      success: 1,
      message: 'Amount transferred successfully',
      data: {
        balance: isAccountUpdated.balance,
      },
    };
  }

  async history(user: UserInterface, body: AccountsDTO.History) {
    const accountDetails = await this.AccountsModel.findOne({
      userId: user._id,
      accountNumber: body.accountNumber,
    });

    if (!accountDetails) {
      throw new HttpException(
        {
          success: 0,
          message: 'Account not found',
          data: {},
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const history = await this.HistoryModel.find({
      account1Id: accountDetails._id,
    }).populate('account2Id', 'accountNumber');

    return {
      success: 1,
      message: 'Success',
      data: {
        history: history || [],
      },
    };
  }
}

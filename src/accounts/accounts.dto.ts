import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class Create {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  initialDepositAmount: number;
}

export class Deposit {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{13}(ACC)[0-9]*$/, { message: 'Invalid account number' })
  accountNumber: string;
}

export class Withdraw {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{13}(ACC)[0-9]*$/, { message: 'Invalid account number' })
  accountNumber: string;
}

export class Transfer {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{13}(ACC)[0-9]*$/, { message: 'Invalid account number' })
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{13}(ACC)[0-9]*$/, {
    message: 'Invalid reciever account number',
  })
  receiverAccountNumber: string;
}

export class History {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{13}(ACC)[0-9]*$/, { message: 'Invalid account number' })
  accountNumber: string;
}

import {
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  Matches,
  Min,
} from 'class-validator';

export class Deposit {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class Withdraw {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class Transfer {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^[0-9]{13}$/, { message: 'cnic should be of 13 digits' })
  cnic: string;
}

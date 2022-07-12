import { IsNotEmpty, IsString, IsNumberString, Matches } from 'class-validator';

export class Signin {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^[0-9]{13}$/, { message: 'cnic should be of 13 digits' })
  cnic: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class Signup {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^[0-9]{13}$/, { message: 'cnic should be of 13 digits' })
  cnic: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export interface MeRes {
  _id: string;
  name: string;
  cnic: string;
  balance: number;
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from 'src/models/user.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as AuthDTO from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Users')
    private UsersModel: Model<UserInterface>,
    private jwt: JwtService,
  ) {}

  async signup(body: AuthDTO.Signup): Promise<any> {
    const doesUserExist = await this.UsersModel.count({ cnic: body.cnic });
    if (doesUserExist) {
      return {
        success: 0,
        message: 'Account already exist',
        data: {},
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(body.password, salt);

    body.password = hash;

    const isUserCreated = await new this.UsersModel(body).save();
    if (isUserCreated) {
      return {
        success: 1,
        message: 'Signed up successfully',
        data: {},
      };
    } else {
      return {
        success: 0,
        message: 'Error occured while processing request',
        data: {},
      };
    }
  }

  async signin(body: AuthDTO.Signin): Promise<any> {
    const user = await this.UsersModel.findOne({ cnic: body.cnic });
    if (!user) {
      throw new HttpException(
        {
          message: 'Account does not exist',
          code: 0,
          data: {},
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordEqual = bcrypt.compareSync(body.password, user.password);
    if (!isPasswordEqual) {
      throw new HttpException(
        {
          success: 0,
          message: 'Invalid password',
          data: {},
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const sessionToken = await this.signToken(user._id.toString(), user.cnic);
    await this.UsersModel.updateOne(
      { cnic: body.cnic },
      { $set: { access_token: sessionToken } },
    );

    return {
      success: 1,
      message: 'Signed in successfully',
      data: {
        sessionToken,
      },
    };
  }

  async signToken(id: string, cnic: string): Promise<string> {
    const payload = { id, cnic };
    return await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }
}

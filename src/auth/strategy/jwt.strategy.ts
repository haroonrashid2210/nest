import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInterface } from 'src/models/user.model';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel('Users')
    private UsersModel: Model<UserInterface>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<any> {
    const id = payload.id;
    const user = await this.UsersModel.findById(id, {
      name: 1,
      cnic: 1,
    });
    return user;
  }
}

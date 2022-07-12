import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDTO from './auth.dto';
import { JwtGuard } from './guard/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: AuthDTO.Signup) {
    return this.authService.signup(body);
  }

  @Post('signin')
  signin(@Body() body: AuthDTO.Signin) {
    return this.authService.signin(body);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: AuthDTO.MeRes) {
    return user;
  }
}

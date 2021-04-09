import {
  BadRequestException,
  NotFoundException,
  ClassSerializerInterceptor,
  Controller,
  Body,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';

import { UserService } from '../user/user.service';

import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (body.password !== body.password_confirm) {
      throw new BadRequestException('Passowrds do not match!');
    }
    const saltOrRounds = 12;
    const hashedPassword = await bcrypt.hash(body.password, saltOrRounds);
    return this.userService
      .create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: hashedPassword,
        role: { id: 1 },
      })
      .catch((err) => {
        throw new BadRequestException('This user already exists');
      });
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (!(await bcrypt.compare(password, (await user).password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    response.cookie('jwt', jwt, { httpOnly: true });

    return user;
  }
  @UseGuards(AuthGuard)
  @Get('user')
  async getUser(@Req() request: Request) {
    const id = await this.authService.getUserId(request);

    return this.userService.findOne({ id }, ['role']);
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return { success: true, message: 'Successfully logged out' };
  }
}

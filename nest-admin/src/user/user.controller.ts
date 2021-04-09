import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UseGuards,
  Put,
  Delete,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './models/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserCreateDto } from './models/userCreate.dto';
import { UserUpdateDto } from './models/userUpdate.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { HasPermission } from '../permission/hasPermission.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get()
  @HasPermission('users')
  async getAllUsers(@Query('page') page = 1) {
    return await this.userService.paginate(page, ['role']);
  }

  @Post()
  @HasPermission('users')
  async createUser(@Body() body: UserCreateDto): Promise<User> {
    const password = await bcrypt.hash('1234', 12);

    const { role_id, ...data } = body;
    console.log(body);
    return this.userService.create({
      ...data,
      password,
      role: { id: body.role_id },
    });
  }
  @Get(':id')
  @HasPermission('users')
  async getUser(@Param('id') id: number) {
    return this.userService.findOne({ id }, ['role']);
  }

  @Put('info')
  async updateInfo(@Req() request: Request, @Body() body: UserUpdateDto) {
    const id = await this.authService.getUserId(request);
    await this.userService.update(id, body);
  }

  @Put('password')
  async updatePassword(
    @Req() request: Request,
    @Body('password') password: string,
    @Body('password_confirm') password_confirm: string,
  ) {
    if (password !== password_confirm) {
      throw new BadRequestException('Passwords do not match!');
    }
    const id = await this.authService.getUserId(request);
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userService.update(id, {
      password: hashedPassword,
    });
    return this.userService.findOne({ id });
  }

  @Put(':id')
  @HasPermission('users')
  async updateUser(@Param('id') id: number, @Body() body: UserUpdateDto) {
    const { role_id, ...data } = body;
    await this.userService.update(id, { ...data, role: { id: role_id } });
    return this.userService.findOne({ id });
  }

  @Delete(':id')
  @HasPermission('users')
  async deleteUser(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}

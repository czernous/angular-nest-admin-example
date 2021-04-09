import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { HasPermission } from '../permission/hasPermission.decorator';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @HasPermission('roles')
  async getAllRoles() {
    return this.roleService.getAll();
  }

  @Post()
  @HasPermission('roles')
  async createRole(
    @Body('name') name: string,
    @Body('permissions') ids: number[],
  ) {
    return this.roleService.create({
      name,
      permissions: ids.map((id) => ({ id })),
    });
  }

  @Get(':id')
  @HasPermission('roles')
  async getRole(@Param('id') id: number) {
    return this.roleService.findOne({ id }, ['permissions']);
  }

  @Put(':id')
  @HasPermission('roles')
  async updateRole(
    @Param('id') id: number,
    @Body('name') name: string,
    @Body('permissions') ids: number[],
  ) {
    await this.roleService.update(id, { name });
    const role = await this.roleService.findOne({ id });

    return this.roleService.create({
      ...role,
      permissions: ids.map((id) => ({ id })),
    });
  }

  @Delete(':id')
  @HasPermission('roles')
  async deleteRole(@Param('id') id: number) {
    return this.roleService.delete(id);
  }
}

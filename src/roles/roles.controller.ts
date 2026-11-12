import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../schemas/role.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard) // Solo usuarios logueados
export class RolesController {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  @Get()
  async findAll() {
    return this.roleModel.find().exec();
  }
}
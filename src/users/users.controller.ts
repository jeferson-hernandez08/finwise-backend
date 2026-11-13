// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard'; // 👈 Importamos
import { Roles } from '../decorators/roles.decorator'; // 👈 Importamos

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // 👈 Protegemos todo el controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin') // 👈 Solo el admin crea
  create(@Body() createUserDto: any): Promise<User> {
    // Usamos el método que encripta la contraseña y recibe el rol
    return this.usersService.createWithPassword(
      createUserDto.email, 
      createUserDto.password, 
      createUserDto.full_name,
      createUserDto.role_id
    );
  }

  @Get()
  @Roles('admin') // 👈 Solo el admin lista
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // El perfil sigue estando disponible para cualquier usuario logueado
  @Get('profile')
  getProfile(@Req() req): any {
    return req.user;
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: any): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
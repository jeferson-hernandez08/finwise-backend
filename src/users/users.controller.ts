// src/users/users.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint público para crear usuarios (sin autenticación)
  @Post()
  create(@Body() createUserDto: any): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  // Endpoint público para listar todos los usuarios
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Endpoint protegido: obtiene el perfil del usuario autenticado
  @Get('profile')
  @UseGuards(JwtAuthGuard)  // Protege esta ruta con JWT
  getProfile(@Req() req): any {
    // req.user contiene el usuario que fue inyectado por JwtStrategy
    return req.user;
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
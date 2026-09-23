// src/users/users.controller.ts
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserId } from '../decorators/user-id.decorator';

/**
 * Solo se expone el perfil propio.
 *
 * El listado de usuarios y el acceso por :id se retiraron: cualquier token
 * valido podia leer todos los usuarios, password_hash incluido. El registro
 * vive ahora en POST /auth/register.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Perfil del usuario autenticado (protegido por el guard global de JWT)
  @Get('profile')
  async getProfile(@UserId() userId: string) {
    const user = await this.usersService.findProfile(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      _id: String(user._id),
      email: user.email,
      full_name: user.full_name,
      google_id: user.google_id,
      created_at: user.created_at,
    };
  }
}

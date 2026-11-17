// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos por la ruta (ej. ['admin'])
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no requiere roles específicos, dejamos pasar
    if (!requiredRoles) {
      return true;
    }

    // Obtenemos el usuario que fue inyectado por el JwtAuthGuard
    const { user } = context.switchToHttp().getRequest();

    // Verificamos si el rol del usuario está en la lista de roles permitidos
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos de Administrador para realizar esta acción');
    }

    return true;
  }
}
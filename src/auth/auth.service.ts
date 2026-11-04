import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // 👇 Extraemos el nombre del rol (ya que hicimos populate)
    const roleName = (user.role_id as any).name; 

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: roleName // Guardamos 'admin' o 'user'
    };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Método auxiliar para generar un token para un usuario (útil para Google OAuth)
  async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }
}
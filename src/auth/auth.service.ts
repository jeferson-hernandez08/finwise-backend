import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

/** Perfil publico: nunca incluye password_hash. */
export interface UserProfile {
  _id: string;
  email: string;
  full_name?: string;
  google_id?: string;
  created_at?: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      access_token: await this.generateToken(String(user._id), user.email),
    };
  }

  // Registro con email y contraseña
  async signUp(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    try {
      const user = await this.usersService.createWithPassword(
        dto.email,
        dto.password,
        dto.full_name,
      );
      return {
        access_token: await this.generateToken(String(user._id), user.email),
      };
    } catch (error) {
      // 11000 = índice único de email: dos registros simultáneos con el mismo correo.
      if (error?.code === 11000) {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }
      throw error;
    }
  }

  // Perfil del usuario del token, mapeado campo a campo para no filtrar el hash
  async getProfile(userId: string): Promise<UserProfile> {
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

  // Método auxiliar para generar un token para un usuario (útil para Google OAuth)
  async generateToken(userId: string, email: string): Promise<string> {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../decorators/public.decorator';
import { UserId } from '../decorators/user-id.decorator';

/** Lo que GoogleStrategy deja en req.user: un documento de Mongoose. */
interface GoogleRequest {
  user?: { _id?: unknown; id?: string; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  // 1. Login con email y contraseña
  @Public()     // Ruta pública
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  // 2. Registro con email y contraseña
  @Public()     // Ruta pública
  @Post('register')
  async signUp(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  // 3. Perfil del usuario autenticado
  @Get('me')
  async me(@UserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  // 4. Iniciar flujo de Google OAuth
  @Public()     // Ruta pública
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // El guard redirige a Google
  }

  // 5. Callback de Google (redirige al frontend con token)
  @Public()   // Ruta pública
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('No se pudo autenticar con Google');
    }

    // El documento de Mongoose trae _id; se acepta id por si llega un objeto plano.
    const userId = String(user._id ?? user.id);
    const token = await this.authService.generateToken(userId, user.email);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    // Redirigir al frontend con el token en la URL
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}

import { Body, Controller, Post, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/decorators/public.decorator';

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
  async signIn(@Body() signInDto: { email: string; password: string }) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  // 2. Iniciar flujo de Google OAuth
  @Public()     // Ruta pública
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // El guard redirige a Google
  }

  // 3. Callback de Google (redirige al frontend con token)
  @Public()   // Ruta pública
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user contiene el usuario validado por GoogleStrategy
    const user = req.user;
    // Generar JWT usando el servicio de autenticación
    const token = await this.authService.generateToken(user.id, user.email);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    // Redirigir al frontend con el token en la URL
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
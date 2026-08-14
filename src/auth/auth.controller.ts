import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }
}

// Otro , validar 
// src/auth/auth.controller.ts
// import { Body, Controller, Post, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { AuthService } from './auth.service';
// import { ConfigService } from '@nestjs/config';

// @Controller('auth')
// export class AuthController {
//   constructor(
//     private authService: AuthService,
//     private configService: ConfigService,
//   ) {}

//   // ... (endpoint /login de antes)

//   @Get('google')
//   @UseGuards(AuthGuard('google'))
//   async googleAuth() {
//     // El guard se encarga de redirigir a Google
//   }

//   @Get('google/callback')
//   @UseGuards(AuthGuard('google'))
//   async googleAuthRedirect(@Req() req, @Res() res) {
//     // req.user contiene el usuario validado por GoogleStrategy[reference:10]
//     // Aquí deberías buscar o crear el usuario en tu DB y generar un JWT
//     // const user = await this.usersService.findOrCreate(req.user);
//     // const token = await this.authService.generateToken(user.id, user.email);
//     // Redirige al frontend con el token[reference:11]
//     const token = 'jwt_token_de_ejemplo'; // Reemplaza con lógica real
//     const frontendUrl = this.configService.get('FRONTEND_URL');
//     res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
//   }
// }
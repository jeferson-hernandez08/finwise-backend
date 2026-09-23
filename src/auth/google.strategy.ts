// src/auth/google.strategy.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../schemas/user.schema';

/**
 * Sin clientID/clientSecret passport-google-oauth20 lanza al construirse y
 * tumba el arranque de toda la API. Con valores de relleno la aplicacion
 * levanta y solo falla el boton de Google, que es el comportamiento util
 * mientras no se configuren las credenciales.
 */
function buildGoogleOptions(configService: ConfigService): StrategyOptions {
  const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
  const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

  if (!clientID || !clientSecret) {
    new Logger('GoogleStrategy').warn(
      'GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET sin definir: el acceso con Google ' +
        'no funcionara hasta configurarlos en el archivo .env.',
    );
  }

  return {
    clientID: clientID || 'google-oauth-sin-configurar',
    clientSecret: clientSecret || 'google-oauth-sin-configurar',
    callbackURL:
      configService.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:3000/auth/google/callback',
    scope: ['email', 'profile'],
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super(buildGoogleOptions(configService));
  }

  /**
   * Devuelve el usuario en lugar de invocar `done`: la envoltura de
   * PassportStrategy ya llama al callback con lo que retorne este metodo,
   * asi que hacer ambas cosas lo ejecutaba dos veces.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google no devolvió un correo electrónico');
    }

    const fullName =
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ') ||
      profile.displayName ||
      email;

    // 1. Buscar si el usuario ya existe por email
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // 2. Si no existe, crearlo con google_id y sin password_hash
      user = await this.usersService.createWithGoogle(email, fullName, profile.id);
    } else if (!user.google_id) {
      // 3. Si existe pero se registró antes con email/password, enlazar la cuenta
      const linked = await this.usersService.updateGoogleId(
        String(user._id),
        profile.id,
      );
      if (linked) {
        user = linked;
      }
    }

    // 4. El objeto retornado se adjunta a req.user
    return user;
  }
}

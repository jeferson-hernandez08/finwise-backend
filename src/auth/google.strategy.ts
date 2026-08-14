// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const email = emails[0].value;
    const fullName = `${name.givenName} ${name.familyName}`;

    // 1. Buscar si el usuario ya existe por email
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // 2. Si no existe, crearlo con google_id y sin password_hash
      user = await this.usersService.createWithGoogle(
        email,
        fullName,
        id, // google_id
      );
    } else {
      // 3. Si existe pero no tiene google_id, actualizarlo (por si se registró con email/password antes)
      if (!user.google_id) {
        await this.usersService.updateGoogleId(user.id, id);
      }
    }

    // 4. Devolver el usuario (se adjuntará a req.user)
    done(null, user);
  }
}
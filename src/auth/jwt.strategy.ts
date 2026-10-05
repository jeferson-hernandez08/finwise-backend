import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
}

/** Sin secreto los tokens no se pueden verificar: mejor fallar al arrancar. */
function jwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error(
      'Falta la variable de entorno JWT_SECRET. Definela en el archivo .env ' +
        '(mira .env.example) antes de arrancar la API.',
    );
  }
  return secret;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload) {
    // payload contiene la información que firmamos en el token (sub, email).
    // Un sub que no sea ObjectId haría estallar findById con un 500.
    if (!payload?.sub || !Types.ObjectId.isValid(payload.sub)) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // El objeto retornado se adjuntará a la request como req.user
    return { userId: payload.sub, email: payload.email };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('app.jwtSecret');
    if (!secret) {
      console.error('[JwtStrategy] JWT_SECRET is not configured!');
    } else {
      console.log('[JwtStrategy] JWT_SECRET configured:', secret ? 'YES' : 'NO');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: string; email: string; role: string }): {
    id: string;
    email: string;
    role: string;
  } {
    console.log('[JwtStrategy] Token validated successfully for user:', payload.email);
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}

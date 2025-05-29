// src/auth/jwt.strategy.ts (수정 제안)
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // UnauthorizedException 임포트 확인
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    console.log('JwtStrategy: validate 호출됨. Payload:', payload);

    // payload.sub (사용자 ID)를 사용하여 DB에서 사용자 정보를 조회합니다.
    const user = await this.authService.validateUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 이 user 객체가 req.user로 주입됩니다.
    // console.log('JwtStrategy: Successfully validated user, passing to NestJS:', user); // 너무 자주 찍히면 주석 처리해도 됨
    return user;
  }
}
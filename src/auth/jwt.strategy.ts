// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtPayload } from './auth.service'; // JWT 페이로드 인터페이스 임포트

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Bearer 토큰에서 JWT 추출
      ignoreExpiration: false, // 만료된 토큰 허용 안 함
      secretOrKey: configService.get<string>('JWT_SECRET'), // .env에서 JWT_SECRET 가져오기
    });
  }

  // JWT가 유효하면 이 메서드가 실행됩니다.
  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      // 사용자 존재하지 않음 (토큰은 유효하나 DB에 없는 사용자)
      return null; // 또는 throw new UnauthorizedException();
    }
    return user; // req.user에 사용자 정보 할당
  }
}
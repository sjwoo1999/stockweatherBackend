// stockweather-backend/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common'; // Consider adding UnauthorizedException
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity'; // 🚨🚨🚨 FIX 2: Ensure this path correctly points to user.entity.ts 🚨🚨🚨

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'yourSecretKey', // Load from environment variable
    });
  }

  async validate(payload: any): Promise<User> {
    // payload.sub is the user ID from the JWT token
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      // Use NestJS's built-in UnauthorizedException for proper error handling
      throw new UnauthorizedException('User not found');
    }
    // Since user.entity.ts now correctly defines favoriteStocks, createdAt, updatedAt,
    // and we're importing from user.entity.ts, this type mismatch should be resolved.
    return user;
  }
}

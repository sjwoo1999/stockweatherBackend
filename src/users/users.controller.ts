// src/users/users.controller.ts
import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { StockSummary, StockDetail } from '../types/stock'; // 프론트엔드와 공유하는 타입 (새로 정의)

@Controller('users') // 기본 경로를 'users'로 설정
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    // ⭐ 중요: JwtStrategy에서 req.user에 직접 주입한 ID를 사용해야 합니다.
    const userId = req.user.id; // ✅ 이 부분을 req.user.id로 변경합니다!

    console.log('GET /users/me 호출됨. req.user:', req.user);
    console.log(`UsersController: 추출된 userId: ${userId}, 타입: ${typeof userId}`);

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('로그인된 사용자 정보를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      kakaoId: user.kakaoId,
      nickname: user.nickname,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // ⭐ 사용자 관심 종목 요약 API 추가 ⭐
  @Get('summary') // /users/summary
  @UseGuards(AuthGuard('jwt'))
  async getUserSummary(@Req() req): Promise<StockSummary[]> {
    const userId = req.user.id; // 인증된 사용자 ID
    console.log(`GET /users/summary 호출됨. 사용자 ID: ${userId}`);
    // 실제 DB에서 userId에 해당하는 관심 종목 요약 정보를 가져오는 로직 구현
    // 현재는 목업 데이터를 반환하는 service 함수 호출
    return this.usersService.getMockUserSummary(userId); // UserService에 추가할 메서드
  }

  // ⭐ 사용자 관심 종목 상세 API 추가 ⭐
  @Get('detail') // /users/detail
  @UseGuards(AuthGuard('jwt'))
  async getUserDetail(@Req() req): Promise<StockDetail[]> {
    const userId = req.user.id; // 인증된 사용자 ID
    console.log(`GET /users/detail 호출됨. 사용자 ID: ${userId}`);
    // 실제 DB에서 userId에 해당하는 관심 종목 상세 정보를 가져오는 로직 구현
    // 현재는 목업 데이터를 반환하는 service 함수 호출
    return this.usersService.getMockUserDetail(userId); // UserService에 추가할 메서드
  }
}
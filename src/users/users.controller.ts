import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
// StockDetail 대신 StockData를 임포트합니다.
import { StockSummary, StockData } from '../types/stock'; // 변경됨

@Controller('users') // 기본 경로를 'users'로 설정
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    const userId = req.user.id; // JwtStrategy에서 req.user에 주입한 ID 사용

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

  // 사용자 관심 종목 요약 API 추가
  @Get('summary') // /users/summary
  @UseGuards(AuthGuard('jwt'))
  async getUserSummary(@Req() req): Promise<StockSummary[]> {
    const userId = req.user.id; // 인증된 사용자 ID
    console.log(`GET /users/summary 호출됨. 사용자 ID: ${userId}`);
    return this.usersService.getMockUserSummary(userId); // UserService에 추가할 메서드
  }

  // 사용자 관심 종목 상세 API 추가
  @Get('detail') // /users/detail
  @UseGuards(AuthGuard('jwt'))
  // 반환 타입을 StockDetail[] 에서 StockData[] 로 변경
  async getUserDetail(@Req() req): Promise<StockData[]> { // 변경됨
    const userId = req.user.id; // 인증된 사용자 ID
    console.log(`GET /users/detail 호출됨. 사용자 ID: ${userId}`);
    return this.usersService.getMockUserDetail(userId); // UserService에 추가할 메서드
  }
}
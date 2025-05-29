// src/users/users.controller.ts (수정 제안)
import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common'; // NotFoundException 추가
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    // ⭐ 중요: JwtStrategy에서 req.user에 직접 주입한 ID를 사용해야 합니다.
    // 당신의 로그에서 req.user는 { id: 2, kakaoId: '1', ... } 형태였습니다.
    // 그러므로 req.user.sub가 아닌 req.user.id를 사용해야 합니다.
    const userId = req.user.id; // ✅ 이 부분을 req.user.id로 변경합니다!

    console.log('GET /users/me 호출됨. req.user:', req.user);
    console.log(`UsersController: 추출된 userId: ${userId}, 타입: ${typeof userId}`); // 디버깅용 로그 추가

    // req.user.sub가 undefined였다는 로그는 이 라인에서 console.log를 찍으면서
    // 잘못된 필드를 사용하려 했기 때문입니다. 이제 req.user.id를 사용합니다.
    // console.log(`UsersController: Invalid userId type in req.user.sub: ${req.user.sub}`); // 이 로그는 이제 필요 없습니다.

    // 실제 사용자 정보를 DB에서 다시 조회합니다.
    const user = await this.usersService.findById(userId);

    if (!user) {
      // 사용자를 찾지 못하면 404 Not Found 응답을 보냅니다.
      throw new NotFoundException('로그인된 사용자 정보를 찾을 수 없습니다.');
    }

    // 보안상 민감한 정보는 제외하고 필요한 정보만 클라이언트에 반환합니다.
    return {
      id: user.id,
      kakaoId: user.kakaoId,
      nickname: user.nickname,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // ... 기타 필요한 정보
    };
  }
}
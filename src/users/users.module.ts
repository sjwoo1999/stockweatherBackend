// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService], // 다른 모듈에서 UsersService를 사용할 수 있도록 내보내기
})
export class UsersModule {}
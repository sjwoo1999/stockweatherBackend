// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common'; // ⭐ forwardRef 임포트 확인 ⭐
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule), // ⭐ AuthModule에 forwardRef 적용되었는지 확인 ⭐
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ⭐ UsersService가 export 되었는지 다시 확인 ⭐
})
export class UsersModule {}
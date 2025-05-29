// src/users/users.service.ts (예시, ORM 환경에 맞게 수정 필요)
import { Injectable, NotFoundException } from '@nestjs/common';
// DB 관련 모듈 임포트 (예: TypeORM의 Repository 또는 Prisma Client)
import { User } from './user.interface'; // User 인터페이스 임포트

@Injectable()
export class UsersService {
  // constructor(
  //   @InjectRepository(UserEntity) // TypeORM 예시
  //   private usersRepository: Repository<UserEntity>,
  // ) {}
  // 또는 Prisma 클라이언트 주입: private prisma: PrismaService

  private readonly users: User[] = []; // ⭐⭐⭐ 임시 메모리 저장소 (실제 DB로 교체 필요) ⭐⭐⭐
                                        // 실제 환경에서는 DB 연동 코드로 대체해야 합니다.
  private nextId = 1;

  // ⭐⭐ 1. 카카오 ID로 사용자 찾기 메서드 ⭐⭐
  async findByKakaoId(kakaoId: string): Promise<User | null> {
    console.log(`UsersService: findByKakaoId 호출됨 (카카오ID: ${kakaoId})`);
    // 실제 DB 연동 코드:
    // return this.usersRepository.findOne({ where: { kakaoId } });
    return this.users.find(user => user.kakaoId === kakaoId) || null; // 임시 메모리 저장소 기준
  }

  // ⭐⭐ 2. 새로운 카카오 사용자 생성 메서드 ⭐⭐
  async createKakaoUser(kakaoUserData: { kakaoId: string; nickname: string; email?: string; profileImage?: string }): Promise<User> {
    console.log('UsersService: createKakaoUser 호출됨', kakaoUserData);
    const newUser: User = {
      id: this.nextId++, // 임시 ID
      ...kakaoUserData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser); // 임시 메모리 저장소
    // 실제 DB 연동 코드:
    // const newUserEntity = this.usersRepository.create(kakaoUserData);
    // return this.usersRepository.save(newUserEntity);
    return newUser;
  }

  // ⭐⭐ 3. ID로 사용자 찾기 메서드 (JWT 인증 후 사용) ⭐⭐
  async findById(id: number): Promise<User | null> {
    console.log(`UsersService: findById 호출됨 (ID: ${id})`);
    // 실제 DB 연동 코드:
    // return this.usersRepository.findOneBy({ id });
    return this.users.find(user => user.id === id) || null; // 임시 메모리 저장소 기준
  }

  // ⭐⭐ 4. (선택 사항) 사용자 정보 업데이트 메서드 ⭐⭐
  // async updateUser(user: User): Promise<User> {
  //   console.log('UsersService: updateUser 호출됨', user);
  //   // 실제 DB 연동 코드:
  //   // return this.usersRepository.save(user);
  //   const index = this.users.findIndex(u => u.id === user.id);
  //   if (index > -1) {
  //     this.users[index] = { ...this.users[index], ...user, updatedAt: new Date() };
  //     return this.users[index];
  //   }
  //   throw new NotFoundException(`User with ID ${user.id} not found.`);
  // }
}
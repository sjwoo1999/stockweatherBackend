// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // user.entity 임포트

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByKakaoId(kakaoId: string): Promise<User | null> { // ✨ Promise<User | null>
    console.log(`UsersService: findByKakaoId 호출됨 (카카오ID: ${kakaoId})`);
    return this.usersRepository.findOne({ where: { kakaoId } });
  }

  async createKakaoUser(userData: { kakaoId: string; nickname?: string; email?: string; profileImage?: string }): Promise<User> {
    console.log('UsersService: createKakaoUser 호출됨', userData);
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> { // ✨ Promise<User | null>
    console.log(`UsersService: findById 호출됨 (ID: ${id})`);
    return this.usersRepository.findOne({ where: { id } });
  }
}
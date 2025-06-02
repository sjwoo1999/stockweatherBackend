// src/news/news.module.ts

import { Module } from '@nestjs/common';
import { NewsService } from './news.service';

@Module({
  providers: [NewsService], // NewsService를 이 모듈의 '제공자'로 등록합니다.
  exports: [NewsService],   // 다른 모듈에서 NewsService를 사용할 수 있도록 '내보냅니다'.
})
export class NewsModule {}
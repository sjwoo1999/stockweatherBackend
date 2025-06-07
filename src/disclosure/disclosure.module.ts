import { Module } from '@nestjs/common';
import { DisclosureService } from './disclosure.service';
import { ConfigModule } from '@nestjs/config'; // DisclosureService가 ConfigService를 사용하므로 필요

@Module({
  imports: [ConfigModule], // DisclosureService가 ConfigService를 주입받으므로 ConfigModule 임포트
  providers: [DisclosureService], // DisclosureService를 이 모듈의 제공자로 등록
  exports: [DisclosureService], // 다른 모듈(예: StockModule)에서 DisclosureService를 사용하려면 export 필수
})
export class DisclosureModule {}

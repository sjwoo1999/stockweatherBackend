// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3001', 'https://stockweather-frontend.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Cloud Run이 PORT 환경 변수를 주입하므로, 이 값을 사용합니다.
  // 로컬 개발 환경을 위해 PORT 환경 변수가 없는 경우 3000을 기본값으로 사용합니다.
  const port = configService.get<number>('PORT') || 3000;

  // ⭐ 중요: 0.0.0.0에서 수신하도록 변경해야 합니다.
  // Cloud Run은 컨테이너 내부의 0.0.0.0:PORT로 트래픽을 보냅니다.
  await app.listen(port, '0.0.0.0'); // <-- 이 부분 수정!

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Listening on port: ${port}`); // 어떤 포트에서 리스닝하는지 로그 추가 (디버깅용)
}
bootstrap();
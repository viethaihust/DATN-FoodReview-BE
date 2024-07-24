import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  //prefix api sẽ được thêm vào trước mỗi route
  app.setGlobalPrefix('api');
  await app.listen(8000);
}
bootstrap();

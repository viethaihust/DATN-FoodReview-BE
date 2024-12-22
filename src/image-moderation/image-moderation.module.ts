import { Module } from '@nestjs/common';
import { ImageModerationController } from './image-moderation.controller';
import { ImageModerationService } from './image-moderation.service';

@Module({
  controllers: [ImageModerationController],
  providers: [ImageModerationService],
})
export class ImageModerationModule {}

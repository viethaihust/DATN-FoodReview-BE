import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ImageModerationService } from 'src/image-moderation/image-moderation.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudinaryService, ImageModerationService],
})
export class UploadModule {}

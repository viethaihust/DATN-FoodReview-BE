import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, CloudinaryService],
})
export class UploadModule {}

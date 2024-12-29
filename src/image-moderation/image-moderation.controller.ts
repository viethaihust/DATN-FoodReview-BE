import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageModerationService } from './image-moderation.service';
import { multerOptions } from 'src/utils/multer';

@Controller('image-moderation')
export class ImageModerationController {
  constructor(
    private readonly imageModerationService: ImageModerationService,
  ) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const isSafe = await this.imageModerationService.analyzeImage(file);
    return { isSafe };
  }
}

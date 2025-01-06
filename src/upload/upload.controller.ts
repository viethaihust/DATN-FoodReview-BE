import {
  Body,
  Controller,
  Delete,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/utils/multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ImageModerationService } from 'src/image-moderation/image-moderation.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly moderationService: ImageModerationService,
  ) {}

  @Post('one-image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadOneImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new UnprocessableEntityException(
        'Vui lòng tải lên ít nhất một tệp.',
      );
    }

    const isSafe = await this.moderationService.analyzeImage(file);
    if (!isSafe) {
      throw new UnprocessableEntityException(
        'Tệp chứa nội dung không an toàn.',
      );
    }

    return await this.cloudinaryService.uploadFile(file);
  }

  @Post('many-files')
  @UseInterceptors(FilesInterceptor('files', 6, multerOptions))
  async uploadManyFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new UnprocessableEntityException(
        'Vui lòng tải lên ít nhất một tệp.',
      );
    }

    if (files.length > 5) {
      throw new UnprocessableEntityException(
        'Chỉ có thể tải lên tối đa 5 tệp.',
      );
    }

    return await this.cloudinaryService.uploadFiles(files);
  }
}

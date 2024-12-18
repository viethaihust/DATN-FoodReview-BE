import {
  Controller,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/utils/multer';
import { UploadService } from './upload.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Post('one-image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadOneImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new UnprocessableEntityException('Hãy upload một ảnh');
    }

    return await this.cloudinaryService.uploadFile(file);
  }

  @Public()
  @Post('many-images')
  //tối đa 10 ảnh
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async uploadManyImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files) {
      throw new UnprocessableEntityException('Hãy upload ít nhất một ảnh');
    }

    return await this.cloudinaryService.uploadFiles(files);
  }
}

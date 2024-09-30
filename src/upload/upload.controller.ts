import {
  Controller,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';
import { multerOptions } from 'src/utils/multer';
import { UploadService } from './upload.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
    console.log(file);
    if (!file) {
      throw new UnprocessableEntityException('Hãy upload một ảnh');
    }

    return await this.cloudinaryService.uploadFile(file);
  }

  @Public()
  @Post('many-images')
  //tối đa 5 ảnh
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  async uploadManyImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
    if (!files) {
      throw new UnprocessableEntityException('Hãy upload ít nhất một ảnh');
    }

    return await this.cloudinaryService.uploadFiles(files);
  }
}

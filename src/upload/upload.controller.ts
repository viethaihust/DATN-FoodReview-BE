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

@Controller('upload')
export class UploadController {
  @Public()
  @Post('one-image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadOneImage(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    if (!file) {
      throw new UnprocessableEntityException('Hãy upload một ảnh');
    }
    return 'Upload one image';
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
    return 'Upload many images';
  }
}

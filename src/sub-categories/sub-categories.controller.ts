import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Public()
  @Get()
  async findAll() {
    try {
      const result = await this.subCategoriesService.findAll();
      return {
        status: HttpStatus.OK,
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    try {
      const result = await this.subCategoriesService.findOneBySlug(slug);
      return {
        status: HttpStatus.OK,
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

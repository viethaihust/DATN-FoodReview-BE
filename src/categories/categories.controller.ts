import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll() {
    try {
      const result = await this.categoriesService.findAll();
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
      const result = await this.categoriesService.findOneBySlug(slug);
      return {
        status: HttpStatus.OK,
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

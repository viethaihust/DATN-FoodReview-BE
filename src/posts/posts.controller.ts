import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { FindAllPostsQueryDto } from './dto/findAllPost.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      const newPost = await this.postsService.createPost(createPostDto);
      return {
        status: HttpStatus.OK,
        newPost,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get()
  async findAll(@Query() queryParams: FindAllPostsQueryDto): Promise<any> {
    try {
      const result = await this.postsService.findAll(queryParams);
      return {
        status: HttpStatus.OK,
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const result = await this.postsService.findOne(id);
      return {
        status: HttpStatus.OK,
        result,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

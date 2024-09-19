import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/createPost.dto';
import { FindAllPostsQueryDto } from './dto/findAllPost.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const newPost = await this.postsService.createPost(createPostDto);
    return {
      message: 'Tạo post thành công',
      data: newPost,
    };
  }

  @Get()
  async findAll(@Query() queryParams: FindAllPostsQueryDto): Promise<any> {
    const result = await this.postsService.findAll(queryParams);
    return {
      message: 'Tìm các post thành công',
      data: result,
    };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const result = await this.postsService.findOne(id);
    return {
      message: 'Tìm post thành công',
      data: result,
    };
  }
}

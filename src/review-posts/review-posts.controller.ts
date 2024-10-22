import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ReviewPostsService } from './review-posts.service';
import { CreateReviewPostDto } from './dto/createReviewPost.dto';
import { FindAllPostsQueryDto } from 'src/posts/dto/findAllPost.dto';
import { FindAllReviewPostDto } from './dto/findAllReviewPost.dto';

@Controller('review-posts')
export class ReviewPostsController {
  constructor(private readonly reviewPostsService: ReviewPostsService) {}

  @Public()
  @Post()
  async create(@Body() createReviewPostDto: CreateReviewPostDto) {
    const newPost =
      await this.reviewPostsService.createReviewPost(createReviewPostDto);
    return {
      message: 'Tạo review post thành công',
      data: newPost,
    };
  }

  @Public()
  @Get()
  async findAll(
    @Query() findAllReviewPostDto: FindAllReviewPostDto,
  ): Promise<any> {
    const result =
      await this.reviewPostsService.findAllReviewPost(findAllReviewPostDto);
    return {
      message: 'Tìm các review post thành công',
      data: result,
    };
  }
}

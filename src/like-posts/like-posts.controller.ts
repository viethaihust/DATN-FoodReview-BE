import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LikePostsService } from './like-posts.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LikePostDto } from './dto/likePost.dto';

@Controller('like-posts')
export class LikePostsController {
  constructor(private readonly likePostsService: LikePostsService) {}

  @Public()
  @Post()
  async create(@Body() likePostDto: LikePostDto) {
    return this.likePostsService.createLikePost(likePostDto);
  }

  @Public()
  @Get('status')
  async checkLikeStatus(
    @Query('userId') userId: string,
    @Query('postId') postId: string,
  ) {
    const likePostDto: LikePostDto = { userId, postId };
    return this.likePostsService.isLiked(likePostDto);
  }

  @Public()
  @Post('unlike')
  async unlikePost(@Body() likePostDto: LikePostDto) {
    return this.likePostsService.unlikePost(likePostDto);
  }
}

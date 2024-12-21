import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LikePostDto } from './dto/likePost.dto';
import { LikesService } from './likes.service';

@Controller('like-posts')
export class LikesController {
  constructor(private readonly likePostsService: LikesService) {}

  @Post()
  async toggleLike(@Body() likePostDto: LikePostDto) {
    return this.likePostsService.toggleLike(likePostDto);
  }

  @Get('status')
  async checkLikeStatus(
    @Query('userId') userId: string,
    @Query('postId') postId: string,
  ) {
    const likePostDto: LikePostDto = { userId, postId };
    return this.likePostsService.isLiked(likePostDto);
  }
}

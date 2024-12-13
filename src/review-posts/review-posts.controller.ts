import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ReviewPostsService } from './review-posts.service';
import { CreateReviewPostDto } from './dto/createReviewPost.dto';
import { FindAllReviewPostDto } from './dto/findAllReviewPost.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateReviewPostDto } from './dto/updateReviewPost.dto';

@Controller('review-posts')
export class ReviewPostsController {
  constructor(
    private readonly reviewPostsService: ReviewPostsService,
    private readonly jwtService: JwtService,
  ) {}

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

  @Public()
  @Get('search')
  async search(@Query('query') query: string) {
    return this.reviewPostsService.search(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    const result = await this.reviewPostsService.findOneReviewPost(id);
    return {
      message: 'Tìm post thành công',
      data: result,
    };
  }

  @Patch(':postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() updateReviewPostDto: UpdateReviewPostDto,
    @Req() req: any,
  ) {
    const { userId } = updateReviewPostDto;
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as { _id: string };

    const post = await this.reviewPostsService.findOneReviewPost(postId);
    if (!post) {
      throw new UnauthorizedException('Post not found');
    }

    if (!decodedToken || decodedToken._id !== post.userId._id.toString()) {
      throw new UnauthorizedException('User ID does not match token');
    }

    const updatedPost = await this.reviewPostsService.updatePost(
      postId,
      updateReviewPostDto,
    );

    return {
      message: 'Post updated successfully',
      data: updatedPost,
    };
  }
}

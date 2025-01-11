import {
  Body,
  Controller,
  Delete,
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
  @Get('random')
  async getRandomPosts(@Query('excludedPostId') excludedPostId: string) {
    return this.reviewPostsService.getRandomPosts(excludedPostId);
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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      _id: string;
      role: string;
    };

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const updatedPost = await this.reviewPostsService.updatePost(
      postId,
      decodedToken._id,
      decodedToken.role,
      updateReviewPostDto,
    );

    return {
      message: 'Post updated successfully',
      data: updatedPost,
    };
  }

  @Delete(':postId')
  async deletePost(@Param('postId') postId: string, @Req() req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      _id: string;
      role: string;
    };

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const deletedPost = await this.reviewPostsService.deletePost(
      postId,
      decodedToken._id,
      decodedToken.role,
    );

    return {
      message: 'Post deleted successfully',
      data: deletedPost,
    };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get()
  async findAll(@Query('postId') postId?: string): Promise<any> {
    return this.commentsService.findAll(postId);
  }

  @Public()
  @Get('replies')
  async findReplies(
    @Query('parentCommentId') parentCommentId?: string,
  ): Promise<any> {
    return this.commentsService.findReplies(parentCommentId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Public()
  @Patch(':id/like')
  async likeComment(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ): Promise<any> {
    return this.commentsService.like(id, userId);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}

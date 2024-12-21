import { Body, Controller, Post } from '@nestjs/common';
import { ReadPostsService } from './read-posts.service';
import { CreateReadPostDto } from './dto/createReadPost.dto';

@Controller('read-posts')
export class ReadPostsController {
  constructor(private readonly readPostsService: ReadPostsService) {}

  @Post()
  async markAsRead(@Body() createReadPostDto: CreateReadPostDto) {
    return this.readPostsService.markAsRead(createReadPostDto);
  }
}

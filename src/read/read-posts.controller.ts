import { Body, Controller, Post } from '@nestjs/common';
import { ReadService } from './read-posts.service';
import { CreateReadDto } from './dto/createReadPost.dto';

@Controller('read-posts')
export class ReadController {
  constructor(private readonly readPostsService: ReadService) {}

  @Post()
  async markAsRead(@Body() createReadPostDto: CreateReadDto) {
    return this.readPostsService.markAsRead(createReadPostDto);
  }
}

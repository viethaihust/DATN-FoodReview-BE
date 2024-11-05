import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/toggleBookmark.dto';
import { CheckBookmarkStatusDto } from './dto/checkBookmarkStatus.dto';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  async toggleBookmark(@Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.toggleBookmark(createBookmarkDto);
  }

  @Get()
  async getUserBookmarks(@Query('userId') userId: string) {
    return this.bookmarkService.getUserBookmarks(userId);
  }

  @Get('status')
  async checkBookmarkStatus(
    @Query() checkBookmarkStatusDto: CheckBookmarkStatusDto,
  ) {
    const isBookmarked = await this.bookmarkService.isPostBookmarked(
      checkBookmarkStatusDto,
    );
    return { isBookmarked };
  }
}

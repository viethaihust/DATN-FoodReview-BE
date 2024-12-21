import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/createFollow.dto';
import { CheckFollowStatusDto } from './dto/checkFollowStatus.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Public()
  @Get('followers-count/:userId')
  async getFollowersCount(@Param('userId') userId: string): Promise<number> {
    return await this.followsService.countFollowers(userId);
  }

  @Public()
  @Get('followings-count/:userId')
  async getFollowingsCount(@Param('userId') userId: string): Promise<number> {
    return await this.followsService.countFollowings(userId);
  }

  @Post()
  async toggleFollow(@Body() createFollowDto: CreateFollowDto) {
    return this.followsService.toggleFollow(createFollowDto);
  }

  @Get('status')
  async checkFollowStatus(@Query() checkFollowStatusDto: CheckFollowStatusDto) {
    const isFollowed =
      await this.followsService.isUserFollowed(checkFollowStatusDto);
    return { isFollowed };
  }
}

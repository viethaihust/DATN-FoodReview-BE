import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Get()
  async getNotificationsForUser(@Query('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Public()
  @Post('markAsRead')
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}

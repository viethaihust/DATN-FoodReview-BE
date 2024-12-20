import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotificationsForUser(@Query('userId') userId: string) {
    return this.notificationService.getNotificationsForUser(userId);
  }

  @Post('markAsRead')
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }
}

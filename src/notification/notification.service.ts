import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(
    receiver: string,
    sender: string,
    postId: string,
    message: string,
  ) {
    const existingNotification = await this.notificationModel.findOne({
      receiver,
      sender,
      postId,
      message,
    });

    if (existingNotification) {
      return existingNotification;
    }

    const notification = new this.notificationModel({
      receiver,
      sender,
      postId,
      message,
      read: false,
    });
    return notification.save();
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { receiver: userId, read: false },
      { $set: { read: true } },
    );
  }

  async getNotificationsForUser(userId: string) {
    return this.notificationModel
      .find({ receiver: userId })
      .sort({ createdAt: -1 });
  }
}

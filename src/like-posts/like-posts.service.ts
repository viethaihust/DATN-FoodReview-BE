import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LikePost } from './schema/likePost.schema';
import { LikePostDto } from './dto/likePost.dto';
import { ReviewPost } from 'src/review-posts/schema/reviewPost.schema';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/users/schema/user.schema';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class LikePostsService {
  constructor(
    @InjectModel(LikePost.name) private readonly likePostModel: Model<LikePost>,
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    @InjectModel(User.name) private readonly userModel: Model<any>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async toggleLike(likePostDto: LikePostDto): Promise<LikePost | null> {
    const { userId, postId } = likePostDto;

    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingLike = await this.likePostModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    const reviewPost = await this.reviewPostModel
      .findById(objectIdPost)
      .populate('userId');
    if (!reviewPost) {
      throw new Error('Post not found');
    }

    const postOwnerId = reviewPost.userId._id.toString();

    const likingUser = await this.userModel.findById(objectIdUser);
    if (!likingUser) {
      throw new Error('User not found');
    }

    if (existingLike) {
      await this.likePostModel.deleteOne({ _id: existingLike._id });

      await this.reviewPostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 },
      });

      return null;
    } else {
      const newLikePost = new this.likePostModel({
        userId: objectIdUser,
        postId: objectIdPost,
      });

      const savedLikePost = await newLikePost.save();

      await this.reviewPostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: 1 },
      });

      if (userId !== postOwnerId) {
        await this.notificationService.createNotification(
          postOwnerId,
          userId,
          postId,
          `thích bài viết "${reviewPost.title}" của bạn`,
        );

        this.notificationGateway.sendNotification(postOwnerId, userId, postId);
      }

      return savedLikePost.populate('userId', 'name');
    }
  }

  async isLiked(likePostDto: LikePostDto): Promise<{ liked: boolean }> {
    const { userId, postId } = likePostDto;

    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const like = await this.likePostModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    return { liked: !!like };
  }
}

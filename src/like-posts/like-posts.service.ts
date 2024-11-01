import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async createLikePost(likePostDto: LikePostDto): Promise<LikePost> {
    const { userId, postId } = likePostDto;

    const reviewPost = await this.reviewPostModel
      .findById(postId)
      .populate('userId');
    if (!reviewPost) {
      throw new Error('Post not found');
    }

    const postOwnerId = reviewPost.userId._id.toString();

    const likingUser = await this.userModel.findById(userId);

    if (!likingUser) {
      throw new Error('User not found');
    }

    const newLikePost = new this.likePostModel({
      userId,
      postId,
    });

    const savedLikePost = await newLikePost.save();

    await this.reviewPostModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: 1 },
    });

    await this.notificationService.createNotification(
      postOwnerId,
      userId,
      postId,
      `${likingUser.name} thích bài viết của bạn!`,
    );

    this.notificationGateway.sendLikeNotification(postOwnerId, userId, postId);

    return savedLikePost.populate('userId', 'name');
  }

  async isLiked(likePostDto: LikePostDto): Promise<{ liked: boolean }> {
    const { userId, postId } = likePostDto;

    const like = await this.likePostModel.findOne({
      userId: userId,
      postId: postId,
    });

    return { liked: !!like };
  }

  async unlikePost(likePostDto: LikePostDto): Promise<void> {
    const { userId, postId } = likePostDto;

    const like = await this.likePostModel.findOneAndDelete({
      userId: userId,
      postId: postId,
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.reviewPostModel.findByIdAndUpdate(postId, {
      $inc: { likesCount: -1 },
    });
  }
}

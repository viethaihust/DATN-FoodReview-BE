import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/createComment.dto';
import { Comment } from './schema/comment.schema';
import { ReviewPost } from 'src/review-posts/schema/reviewPost.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll(postId?: string): Promise<Comment[]> {
    const query: any = { parentCommentId: { $exists: false } };
    if (postId) {
      query.postId = new Types.ObjectId(postId);
    }

    return this.commentModel
      .find(query)
      .populate('userId', '_id name image')
      .exec();
  }

  async findReplies(parentCommentId?: string): Promise<Comment[]> {
    if (!Types.ObjectId.isValid(parentCommentId)) {
      throw new NotFoundException('Invalid parentCommentId');
    }

    const replies = await this.commentModel
      .find({ parentCommentId: new Types.ObjectId(parentCommentId) })
      .populate('userId', '_id name image')
      .exec();

    if (!replies.length) {
      throw new NotFoundException('No replies found for this comment');
    }

    return replies;
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('userId')
      .exec();
    if (!comment) {
      throw new NotFoundException('Không tìm thấy comment');
    }
    return comment;
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { userId, content, postId, parentCommentId } = createCommentDto;

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid userId');
    }
    if (!Types.ObjectId.isValid(postId)) {
      throw new NotFoundException('Invalid postId');
    }

    const newComment = new this.commentModel({
      userId: new Types.ObjectId(userId),
      content,
      likes: 0,
      replies: 0,
      postId: new Types.ObjectId(postId),
      parentCommentId: parentCommentId
        ? new Types.ObjectId(parentCommentId)
        : undefined,
    }) as Comment & Document<any, any, Comment>;

    const reviewPost = await this.reviewPostModel
      .findById(newComment.postId)
      .populate('userId');

    if (!reviewPost) {
      throw new Error('Post not found');
    }

    if (parentCommentId) {
      if (!Types.ObjectId.isValid(parentCommentId)) {
        throw new NotFoundException('Invalid parentCommentId');
      }

      const parentComment = await this.commentModel.findByIdAndUpdate(
        new Types.ObjectId(parentCommentId),
        { $inc: { replies: 1 } },
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      const parentCommentOwnerId = parentComment.userId.toString();

      if (userId !== parentCommentOwnerId) {
        await this.notificationService.createNotification(
          parentCommentOwnerId,
          userId,
          postId,
          `trả lời bình luận của bạn trong bài viết "${reviewPost.title}"`,
        );

        this.notificationGateway.sendNotification(
          parentCommentOwnerId,
          userId,
          postId,
        );
      }
    } else {
      const postOwnerId = reviewPost.userId._id.toString();

      if (userId !== postOwnerId) {
        await this.notificationService.createNotification(
          postOwnerId,
          userId,
          postId,
          `bình luận bài viết "${reviewPost.title}" của bạn`,
        );

        this.notificationGateway.sendNotification(postOwnerId, userId, postId);
      }
    }

    const savedComment = await newComment.save();
    return savedComment.populate('userId', 'name image');
  }

  async like(id: string, userId: string): Promise<Comment> {
    try {
      const comment = await this.findOne(id);

      if (!comment) {
        throw new Error('Comment not found');
      }

      const userObjectId = new Types.ObjectId(userId);
      const userLiked = comment.likedBy.some((likedByUserId) =>
        likedByUserId.equals(userObjectId),
      );

      if (userLiked) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter(
          (likedByUserId) => !likedByUserId.equals(userObjectId),
        );
      } else {
        comment.likes += 1;
        comment.likedBy.push(userObjectId);
      }

      await comment.save();

      return comment;
    } catch (error) {
      throw new Error(`Failed to like/unlike comment: ${error.message}`);
    }
  }

  async delete(id: string): Promise<Comment | null> {
    const objectId = new Types.ObjectId(id);
    return this.commentModel.findByIdAndDelete(objectId).exec();
  }
}

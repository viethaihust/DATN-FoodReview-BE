import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/createComment.dto';
import { Comment } from './schema/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  async findAll(postId?: string): Promise<Comment[]> {
    const query: any = { parentCommentId: { $exists: false } };
    if (postId) {
      query.postId = new Types.ObjectId(postId);
    }

    return this.commentModel.find(query).populate('userId', '_id name').exec();
  }

  async findReplies(parentCommentId?: string): Promise<Comment[]> {
    if (!Types.ObjectId.isValid(parentCommentId)) {
      throw new NotFoundException('Invalid parentCommentId');
    }

    const replies = await this.commentModel
      .find({ parentCommentId: new Types.ObjectId(parentCommentId) })
      .populate('userId', '_id name')
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

    if (parentCommentId) {
      if (!Types.ObjectId.isValid(parentCommentId)) {
        throw new NotFoundException('Invalid parentCommentId');
      }

      const parentComment = await this.commentModel.findByIdAndUpdate(
        new Types.ObjectId(parentCommentId),
        {
          $inc: { replies: 1 },
        },
      );
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const savedComment = await newComment.save();
    return savedComment.populate('userId', 'name');
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

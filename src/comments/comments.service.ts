import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/createComment.dto';
import { Comment } from './comment.model';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
  ) {}

  async findAll(postId?: string): Promise<Comment[]> {
    const query: any = {};
    if (postId) {
      query.postId = postId;
    }
    return this.commentModel.find(query).populate('user replies').exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('user replies')
      .exec();
    if (!comment) {
      throw new NotFoundException('Không tìm thấy comment');
    }
    return comment;
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { user, content, postId, parentCommentId } = createCommentDto;

    const newComment = new this.commentModel({
      user,
      content,
      likes: 0,
      replies: [],
      postId,
      parentCommentId,
    }) as Comment & Document<any, any, Comment>;

    if (parentCommentId) {
      const parentComment = await this.commentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      parentComment.replies.push(newComment._id);
      await parentComment.save();
    }

    const savedComment = await newComment.save();
    return savedComment.populate('user', 'name');
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

  // async reply(
  //   id: string,
  //   createCommentDto: CreateCommentDto,
  // ): Promise<Comment> {
  //   const comment = await this.findOne(id);
  //   const reply = new this.commentModel(createCommentDto);
  //   comment.replies.push(reply);
  //   await reply.save();
  //   return comment.save();
  // }

  async delete(id: string): Promise<Comment> {
    return this.commentModel.findByIdAndDelete(id).exec();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { CreateCommentDto } from './dto/createComment.dto';
import { Comment } from './comment.model';
import { Post } from 'src/posts/post.model';
import { User } from 'src/users/user.model';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('User') private readonly postUser: Model<User>,
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

    if (postId) {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      post.comments.push(newComment._id);
      await post.save();
    }

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

  async like(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.likes += 1;
    return comment.save();
  }

  async reply(
    id: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    const reply = new this.commentModel(createCommentDto);
    comment.replies.push(reply);
    await reply.save();
    return comment.save();
  }

  async delete(id: string): Promise<Comment> {
    return this.commentModel.findByIdAndDelete(id).exec();
  }
}

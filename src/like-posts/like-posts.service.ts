import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LikePost } from './schema/likePost.schema';
import { LikePostDto } from './dto/likePost.dto';

@Injectable()
export class LikePostsService {
  constructor(
    @InjectModel(LikePost.name) private readonly likePostModel: Model<LikePost>,
  ) {}

  async createLikePost(likePostDto: LikePostDto): Promise<LikePost> {
    const { userId, postId } = likePostDto;

    const newLikePost = new this.likePostModel({
      userId,
      postId,
    });

    const savedLikePost = await newLikePost.save();
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
  }
}

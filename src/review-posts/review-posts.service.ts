import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewPost } from './schema/reviewPost.schema';
import { CreateReviewPostDto } from './dto/createReviewPost.dto';
import { FindAllReviewPostDto } from './dto/findAllReviewPost.dto';

@Injectable()
export class ReviewPostsService {
  constructor(
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
  ) {}

  async createReviewPost(
    createReviewPostDto: CreateReviewPostDto,
  ): Promise<ReviewPost> {
    const { userId, categoryId, ...rest } = createReviewPostDto;

    const newPost = new this.reviewPostModel({
      ...rest,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(categoryId),
    });
    return await newPost.save();
  }

  async findAllReviewPost(
    findAllReviewPostDto: FindAllReviewPostDto,
  ): Promise<{ posts: ReviewPost[]; totalPosts: number }> {
    const { page = 1, pageSize = 5 } = findAllReviewPostDto;

    let query: any = {};

    const totalPosts = await this.reviewPostModel.countDocuments(query).exec();
    const posts = await this.reviewPostModel
      .find(query)
      .populate('categoryId')
      .populate('userId', 'name')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return { posts, totalPosts };
  }
}

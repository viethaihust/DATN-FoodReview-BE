import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewPost } from './schema/reviewPost.schema';
import { CreateReviewPostDto } from './dto/createReviewPost.dto';
import { FindAllReviewPostDto } from './dto/findAllReviewPost.dto';
import { User } from 'src/users/schema/user.schema';
import { UpdateReviewPostDto } from './dto/updateReviewPost.dto';

@Injectable()
export class ReviewPostsService {
  constructor(
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async createReviewPost(
    createReviewPostDto: CreateReviewPostDto,
  ): Promise<ReviewPost> {
    const { userId, categoryId, locationId, ...rest } = createReviewPostDto;

    const newPost = new this.reviewPostModel({
      ...rest,
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(categoryId),
      locationId: new Types.ObjectId(locationId),
    });
    return await newPost.save();
  }

  async findAllReviewPost(
    findAllReviewPostDto: FindAllReviewPostDto,
  ): Promise<{ posts: ReviewPost[]; totalPosts: number }> {
    const { page = 1, pageSize = 5, userId } = findAllReviewPostDto;

    const query: any = {};
    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }

    const totalPosts = await this.reviewPostModel.countDocuments(query).exec();
    const posts = await this.reviewPostModel
      .find(query)
      .populate('categoryId')
      .populate('locationId')
      .populate('userId', 'name')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return { posts, totalPosts };
  }

  async findOneReviewPost(id: string): Promise<ReviewPost> {
    const post = await this.reviewPostModel
      .findById(id)
      .populate('userId', 'name')
      .populate('categoryId')
      .populate('locationId')
      .exec();
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài post');
    }
    return post;
  }

  async search(query: string) {
    const userResults = await this.userModel
      .find({ $text: { $search: query } })
      .exec();

    const postResults = await this.reviewPostModel
      .find({ $text: { $search: query } })
      .populate('userId', 'name')
      .populate('categoryId')
      .populate('locationId')
      .exec();

    return { users: userResults, posts: postResults };
  }

  async updatePost(
    postId: string,
    updateData: UpdateReviewPostDto,
  ): Promise<ReviewPost> {
    const { userId } = updateData;
    const objectIdUser = new Types.ObjectId(userId);

    return this.reviewPostModel
      .findByIdAndUpdate(
        postId,
        { ...updateData, userId: objectIdUser },
        { new: true },
      )
      .exec();
  }
}

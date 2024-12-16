import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReviewPost } from './schema/reviewPost.schema';
import { CreateReviewPostDto } from './dto/createReviewPost.dto';
import { FindAllReviewPostDto } from './dto/findAllReviewPost.dto';
import { User } from 'src/users/schema/user.schema';
import { UpdateReviewPostDto } from './dto/updateReviewPost.dto';
import { Bookmark } from 'src/bookmark/schema/bookmark.schema';
import { LikePost } from 'src/like-posts/schema/likePost.schema';
import { Comment } from 'src/comments/schema/comment.schema';
import { Notification } from 'src/notification/schema/notification.schema';

@Injectable()
export class ReviewPostsService {
  constructor(
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<User>,
    @InjectModel(LikePost.name) private readonly likePostModel: Model<User>,
    @InjectModel(Comment.name) private readonly commentModel: Model<User>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<User>,
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
    decodedUserId: string,
    updateData: UpdateReviewPostDto,
  ): Promise<ReviewPost> {
    const post = await this.reviewPostModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài post');
    }

    if (post.userId.toString() !== decodedUserId) {
      throw new UnauthorizedException('Bạn không có quyền xóa bài post này');
    }

    const { userId, categoryId, locationId } = updateData;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdCategory = new Types.ObjectId(categoryId);
    const objectIdLocation = new Types.ObjectId(locationId);

    return this.reviewPostModel
      .findByIdAndUpdate(
        postId,
        {
          ...updateData,
          userId: objectIdUser,
          categoryId: objectIdCategory,
          locationId: objectIdLocation,
        },
        { new: true },
      )
      .exec();
  }

  async getRandomPosts(excludedPostId: string): Promise<ReviewPost[]> {
    try {
      const excludedObjectId = new Types.ObjectId(excludedPostId);
      const randomPosts = await this.reviewPostModel.aggregate([
        { $match: { _id: { $ne: excludedObjectId } } },
        { $sample: { size: 3 } },
      ]);

      return randomPosts;
    } catch (error) {
      throw new Error('Error fetching random posts');
    }
  }

  async deletePost(
    postId: string,
    decodedUserId: string,
    decodedUserRole: string,
  ): Promise<ReviewPost> {
    const post = await this.reviewPostModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Không tìm thấy bài post');
    }

    if (
      decodedUserRole !== 'admin' &&
      post.userId.toString() !== decodedUserId
    ) {
      throw new UnauthorizedException('Bạn không có quyền xóa bài post này');
    }

    const objectIdPost = new Types.ObjectId(postId);

    await Promise.all([
      this.bookmarkModel.deleteMany({ postId: objectIdPost }),
      this.likePostModel.deleteMany({ postId: objectIdPost }),
      this.commentModel.deleteMany({ postId: objectIdPost }),
      this.notificationModel.deleteMany({ postId: objectIdPost }),
    ]);

    await this.reviewPostModel.findByIdAndDelete(objectIdPost).exec();

    return post;
  }
}

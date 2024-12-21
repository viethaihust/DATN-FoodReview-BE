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
import { Comment } from 'src/comments/schema/comment.schema';
import { Notification } from 'src/notification/schema/notification.schema';
import { Like } from 'src/likes/schema/likes.schema';
import { Follow } from 'src/follows/schema/follow.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Injectable()
export class ReviewPostsService {
  constructor(
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectModel(Follow.name)
    private readonly followModel: Model<Follow>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
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

    const savedPost = await newPost.save();

    const followers = await this.followModel.find({
      followingId: new Types.ObjectId(userId),
    });

    for (const follower of followers) {
      const notificationMessage = `vừa đăng một bài viết mới: "${savedPost.title}"`;

      await this.notificationService.createNotification(
        follower.followerId.toString(),
        userId,
        savedPost._id.toString(),
        notificationMessage,
      );

      this.notificationGateway.sendNotification(
        follower.followerId.toString(),
        userId,
        savedPost._id.toString(),
      );
    }

    return savedPost;
  }

  async findAllReviewPost(findAllReviewPostDto: FindAllReviewPostDto): Promise<{
    posts: ReviewPost[];
    page: number;
    pageSize: number;
    totalPosts: number;
  }> {
    const {
      page = 1,
      pageSize = 5,
      userId,
      categoryId,
      province,
    } = findAllReviewPostDto;

    const query: any = {};

    if (userId) {
      query.userId = new Types.ObjectId(userId);
    }
    if (categoryId) {
      query.categoryId = new Types.ObjectId(categoryId);
    }

    const locationFilter =
      province && province !== 'Tất cả' ? { province } : {};

    const totalPosts = await this.reviewPostModel
      .find(query)
      .populate({
        path: 'locationId',
        match: locationFilter,
      })
      .countDocuments()
      .exec();

    const posts = await this.reviewPostModel
      .find(query)
      .populate('categoryId')
      .populate('locationId')
      .populate('userId', 'name image')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .exec();

    return { posts, page, pageSize, totalPosts };
  }

  async findOneReviewPost(id: string): Promise<ReviewPost> {
    const post = await this.reviewPostModel
      .findById(id)
      .populate('userId', 'name image')
      .populate('categoryId')
      .populate('locationId')
      .exec();
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài post');
    }
    return post;
  }

  async search(query: string) {
    const regex = new RegExp(query, 'i');

    const userResults = await this.userModel
      .find({ name: { $regex: regex } })
      .exec();

    const postResults = await this.reviewPostModel
      .find({
        $or: [{ title: { $regex: regex } }, { content: { $regex: regex } }],
      })
      .populate('userId', 'name image')
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
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  image: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: '$userId',
        },
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
      this.likeModel.deleteMany({ postId: objectIdPost }),
      this.commentModel.deleteMany({ postId: objectIdPost }),
      this.notificationModel.deleteMany({ postId: objectIdPost }),
    ]);

    await this.reviewPostModel.findByIdAndDelete(objectIdPost).exec();

    return post;
  }
}

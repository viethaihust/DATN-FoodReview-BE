import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocationDto } from './dto/createLocation.dto';
import { Model, Types } from 'mongoose';
import { Location } from './schema/location.schema';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { ReviewPost } from 'src/review-posts/schema/reviewPost.schema';
import { Bookmark } from 'src/bookmark/schema/bookmark.schema';
import { Like } from 'src/likes/schema/likes.schema';
import { Comment } from 'src/comments/schema/comment.schema';
import { Viewed } from 'src/viewed/schema/viewed.schema';
import { Notification } from 'src/notification/schema/notification.schema';
import { extractPublicId } from 'cloudinary-build-url';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import extractResourceType from 'src/utils/extractResourceType';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
    @InjectModel(ReviewPost.name)
    private readonly reviewPostModel: Model<ReviewPost>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Viewed.name) private readonly viewedModel: Model<Viewed>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { userId } = createLocationDto;
    const objectUserId = new Types.ObjectId(userId);

    const newLocation = new this.locationModel({
      ...createLocationDto,
      userId: objectUserId,
    });

    return newLocation.save();
  }

  async search(query: string) {
    const regex = new RegExp(query, 'i');
    return this.locationModel.find({
      $or: [{ name: { $regex: regex } }, { address: { $regex: regex } }],
    });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }

  async findAll(
    page?: number,
    pageSize?: number,
  ): Promise<{ locations: Location[]; totalLocations: number }> {
    const skip = (page - 1) * pageSize || 0;

    const locations = await this.locationModel
      .aggregate([
        { $skip: skip },
        { $limit: pageSize || Number.MAX_SAFE_INTEGER },
        {
          $lookup: {
            from: 'reviewposts',
            localField: '_id',
            foreignField: 'locationId',
            as: 'associatedPosts',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            address: 1,
            latLong: 1,
            associatedPostsCount: { $size: '$associatedPosts' },
          },
        },
      ])
      .exec();

    const totalLocations = await this.locationModel.countDocuments().exec();

    return { locations, totalLocations };
  }

  async getUsersLocation(userId: string): Promise<Location[]> {
    const objectUserId = new Types.ObjectId(userId);
    return this.locationModel.find({ userId: objectUserId }).exec();
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
    userRole: string,
  ): Promise<Location> {
    const location = await this.locationModel.findById(id);

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.userId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        'You are not authorized to update this location',
      );
    }

    const updatedLocation = await this.locationModel.findByIdAndUpdate(
      id,
      { $set: updateLocationDto },
      { new: true },
    );

    return updatedLocation;
  }

  async deleteLocation(
    locationId: string,
    userId: string,
    userRole: string,
  ): Promise<{ message: string }> {
    const location = await this.locationModel.findById(locationId);

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const locationObjectId = new Types.ObjectId(locationId);

    const associatedPosts = await this.reviewPostModel.find({
      locationId: locationObjectId,
    });

    if (userRole === 'user') {
      if (location.userId.toString() !== userId) {
        throw new ForbiddenException(
          'You are not authorized to delete this location',
        );
      }

      if (associatedPosts.length > 0) {
        throw new ForbiddenException(
          `Không thể xóa địa điểm vì có ${associatedPosts.length} bài đăng liên quan đến địa điểm này`,
        );
      }
    } else if (userRole === 'admin') {
      for (const post of associatedPosts) {
        const objectIdPost = new Types.ObjectId(post._id as string);
        await Promise.all([
          this.bookmarkModel.deleteMany({ postId: objectIdPost }),
          this.likeModel.deleteMany({ postId: objectIdPost }),
          this.commentModel.deleteMany({ postId: objectIdPost }),
          this.notificationModel.deleteMany({ postId: objectIdPost }),
          this.viewedModel.deleteMany({ postId: objectIdPost }),
        ]);
        const oldPublicIds = post.files
          ? post.files.map((file) => extractPublicId(file))
          : [];

        const resourceTypes = post.files
          ? post.files.map((file) => extractResourceType(file))
          : [];

        if (post.files && post.files.length > 0) {
          await this.cloudinaryService.deleteFiles(oldPublicIds, resourceTypes);
        }
        await this.reviewPostModel.findByIdAndDelete(objectIdPost).exec();
      }
    } else {
      throw new ForbiddenException('Invalid role');
    }

    await this.locationModel.findByIdAndDelete(locationId);

    return { message: 'Location deleted successfully' };
  }
}

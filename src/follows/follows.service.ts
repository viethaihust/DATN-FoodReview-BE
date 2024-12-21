import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schema/follow.schema';
import { Model, Types } from 'mongoose';
import { CreateFollowDto } from './dto/createFollow.dto';
import { CheckFollowStatusDto } from './dto/checkFollowStatus.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
  ) {}

  async countFollowers(userId: string): Promise<number> {
    const objectIdFollowingUser = new Types.ObjectId(userId);
    const followersCount = await this.followModel.countDocuments({
      followingId: objectIdFollowingUser,
    });
    return followersCount;
  }

  async countFollowings(userId: string): Promise<number> {
    const objectIdFollowerUser = new Types.ObjectId(userId);
    const followingsCount = await this.followModel.countDocuments({
      followerId: objectIdFollowerUser,
    });
    return followingsCount;
  }

  async toggleFollow(createFollowDto: CreateFollowDto) {
    const { followerId, followingId } = createFollowDto;
    const existingFollow = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    if (existingFollow) {
      await this.followModel.deleteOne({ _id: existingFollow._id });
      return { message: 'Unfollowed successfully.', isFollowing: false };
    } else {
      await this.followModel.create({
        followerId: new Types.ObjectId(followerId),
        followingId: new Types.ObjectId(followingId),
      });
      return { message: 'Followed successfully.', isFollowing: true };
    }
  }

  async isUserFollowed(
    checkFollowStatusDto: CheckFollowStatusDto,
  ): Promise<boolean> {
    const { followerId, followingId } = checkFollowStatusDto;
    const objectIdFollowerUser = new Types.ObjectId(followerId);
    const objectIdFollowingUser = new Types.ObjectId(followingId);

    const existingFollow = await this.followModel.findOne({
      followerId: objectIdFollowerUser,
      followingId: objectIdFollowingUser,
    });

    return !!existingFollow;
  }
}

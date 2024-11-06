import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bookmark } from './schema/bookmark.schema';
import { CreateBookmarkDto } from './dto/toggleBookmark.dto';
import { CheckBookmarkStatusDto } from './dto/checkBookmarkStatus.dto';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<Bookmark>,
  ) {}

  async toggleBookmark(
    createBookmarkDto: CreateBookmarkDto,
  ): Promise<Bookmark | null> {
    const { userId, postId } = createBookmarkDto;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingBookmark = await this.bookmarkModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    if (existingBookmark) {
      await this.bookmarkModel.deleteOne({ _id: existingBookmark._id });
      return null;
    } else {
      const bookmark = new this.bookmarkModel({
        userId: objectIdUser,
        postId: objectIdPost,
      });
      return bookmark.save();
    }
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    const objectId = new Types.ObjectId(userId);
    return this.bookmarkModel
      .find({ userId: objectId })
      .populate({
        path: 'postId',
        populate: {
          path: 'userId',
          select: 'name',
        },
      })
      .exec();
  }

  async isPostBookmarked(
    checkBookmarkStatusDto: CheckBookmarkStatusDto,
  ): Promise<boolean> {
    const { userId, postId } = checkBookmarkStatusDto;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingBookmark = await this.bookmarkModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    return !!existingBookmark;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bookmark } from 'src/bookmark/schema/bookmark.schema';
import { Comment } from 'src/comments/schema/comment.schema';
import { Like } from 'src/likes/schema/likes.schema';
import { Viewed } from 'src/viewed/schema/viewed.schema';

@Injectable()
export class UserInteractionService {
  constructor(
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    @InjectModel(Viewed.name) private readonly viewedModel: Model<Viewed>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  async getUserInteractions(userId: string): Promise<Types.ObjectId[]> {
    try {
      // Fetch likes, bookmarks, views, and comments associated with the userId
      const [likes, bookmarks, views, comments] = await Promise.all([
        this.likeModel
          .find({ userId: new Types.ObjectId(userId) })
          .select('postId'),
        this.bookmarkModel
          .find({ userId: new Types.ObjectId(userId) })
          .select('postId'),
        this.viewedModel
          .find({ userId: new Types.ObjectId(userId) })
          .select('postId'),
        this.commentModel
          .find({ userId: new Types.ObjectId(userId) })
          .select('postId'),
      ]);

      // Extract postIds from each array
      const postIds = [
        ...likes.map((like) => like.postId),
        ...bookmarks.map((bookmark) => bookmark.postId),
        ...views.map((view) => view.postId),
        ...comments.map((comment) => comment.postId),
      ];

      // Remove duplicates and convert to ObjectId
      const uniquePostIds = Array.from(
        new Set(postIds.map((id) => id.toString())),
      ).map((id) => new Types.ObjectId(id));

      return uniquePostIds;
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      return [];
    }
  }
}

import { Module } from '@nestjs/common';
import { ReviewPostsService } from './review-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewPost, ReviewPostSchema } from './schema/reviewPost.schema';
import { ReviewPostsController } from './review-posts.controller';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schema/bookmark.schema';
import {
  LikePost,
  LikePostSchema,
} from 'src/like-posts/schema/likePost.schema';
import { Comment, CommentSchema } from 'src/comments/schema/comment.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: LikePost.name, schema: LikePostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [ReviewPostsService, JwtService],
  controllers: [ReviewPostsController],
})
export class ReviewPostsModule {}

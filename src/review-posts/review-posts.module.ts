import { Module } from '@nestjs/common';
import { ReviewPostsService } from './review-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewPost, ReviewPostSchema } from './schema/reviewPost.schema';
import { ReviewPostsController } from './review-posts.controller';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schema/bookmark.schema';
import { Comment, CommentSchema } from 'src/comments/schema/comment.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schema/notification.schema';
import { Like, LikeSchema } from 'src/likes/schema/likes.schema';
import { Follow, FollowSchema } from 'src/follows/schema/follow.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { Location, LocationSchema } from 'src/location/schema/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Location.name, schema: LocationSchema },
    ]),
    NotificationModule,
  ],
  providers: [ReviewPostsService, JwtService],
  controllers: [ReviewPostsController],
})
export class ReviewPostsModule {}

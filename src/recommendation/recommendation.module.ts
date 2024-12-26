import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { ReviewPostsService } from 'src/review-posts/review-posts.service';
import { UserInteractionService } from 'src/user-interaction/user-interaction.service';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schema/bookmark.schema';
import { Like, LikeSchema } from 'src/likes/schema/likes.schema';
import { Comment, CommentSchema } from 'src/comments/schema/comment.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schema/notification.schema';
import { Follow, FollowSchema } from 'src/follows/schema/follow.schema';
import { Location, LocationSchema } from 'src/location/schema/location.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { Viewed, ViewedSchema } from 'src/viewed/schema/viewed.schema';
import {
  Recommendation,
  RecommendationSchema,
} from './schema/recommendation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Location.name, schema: LocationSchema },
      { name: Viewed.name, schema: ViewedSchema },
    ]),
    NotificationModule,
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    ReviewPostsService,
    UserInteractionService,
  ],
})
export class RecommendationModule {}

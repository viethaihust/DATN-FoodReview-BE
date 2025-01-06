import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './schema/location.schema';
import { JwtService } from '@nestjs/jwt';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schema/bookmark.schema';
import { Like, LikeSchema } from 'src/likes/schema/likes.schema';
import { Comment, CommentSchema } from 'src/comments/schema/comment.schema';
import { Viewed, ViewedSchema } from 'src/viewed/schema/viewed.schema';
import {
  Notification,
  NotificationSchema,
} from 'src/notification/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Viewed.name, schema: ViewedSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, JwtService, CloudinaryService],
})
export class LocationModule {}

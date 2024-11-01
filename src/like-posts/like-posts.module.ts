import { Module } from '@nestjs/common';
import { LikePostsController } from './like-posts.controller';
import { LikePostsService } from './like-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LikePost, LikePostSchema } from './schema/likePost.schema';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LikePost.name, schema: LikePostSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationModule,
  ],
  controllers: [LikePostsController],
  providers: [LikePostsService],
})
export class LikePostsModule {}

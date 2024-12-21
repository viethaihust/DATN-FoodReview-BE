import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Like, LikeSchema } from './schema/likes.schema';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    NotificationModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}

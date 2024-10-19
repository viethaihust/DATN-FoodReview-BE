import { Module } from '@nestjs/common';
import { LikePostsController } from './like-posts.controller';
import { LikePostsService } from './like-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LikePost, LikePostSchema } from './schema/likePost.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LikePost.name, schema: LikePostSchema },
    ]),
  ],
  controllers: [LikePostsController],
  providers: [LikePostsService],
})
export class LikePostsModule {}

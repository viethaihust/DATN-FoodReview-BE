import { Module } from '@nestjs/common';
import { ReviewPostsService } from './review-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewPost, ReviewPostSchema } from './schema/reviewPost.schema';
import { ReviewPostsController } from './review-posts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewPost.name, schema: ReviewPostSchema },
    ]),
  ],
  providers: [ReviewPostsService],
  controllers: [ReviewPostsController],
})
export class ReviewPostsModule {}

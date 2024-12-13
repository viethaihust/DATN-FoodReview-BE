import { Module } from '@nestjs/common';
import { ReviewPostsService } from './review-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewPost, ReviewPostSchema } from './schema/reviewPost.schema';
import { ReviewPostsController } from './review-posts.controller';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ReviewPostsService, JwtService],
  controllers: [ReviewPostsController],
})
export class ReviewPostsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInteractionService } from './user-interaction.service';
import { Like, LikeSchema } from 'src/likes/schema/likes.schema';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schema/bookmark.schema';
import { Comment, CommentSchema } from 'src/comments/schema/comment.schema';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { Viewed, ViewedSchema } from 'src/viewed/schema/viewed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
      { name: User.name, schema: UserSchema },
      { name: Viewed.name, schema: ViewedSchema },
    ]),
  ],
  providers: [UserInteractionService],
})
export class UserInteractionModule {}

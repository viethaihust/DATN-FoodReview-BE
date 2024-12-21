import { Module } from '@nestjs/common';
import { ReadPostsController } from './read-posts.controller';
import { ReadPostsService } from './read-posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadPost, ReadPostSchema } from './schema/readPost.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReadPost.name, schema: ReadPostSchema },
    ]),
  ],
  controllers: [ReadPostsController],
  providers: [ReadPostsService],
})
export class ReadPostsModule {}

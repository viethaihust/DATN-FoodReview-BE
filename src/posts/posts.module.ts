import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './post.model';
import { CategoriesModule } from 'src/categories/categories.module';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]), CategoriesModule],
  providers: [PostsService, CategoriesService],
  controllers: [PostsController],
})
export class PostsModule {}

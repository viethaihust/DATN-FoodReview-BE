import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubCategoriesModule } from './sub-categories/sub-categories.module';
import { AtGuard } from './common/guards/accessToken.guard';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LikePostsModule } from './like-posts/like-posts.module';
import { ReviewPostsModule } from './review-posts/review-posts.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    PostsModule,
    CategoriesModule,
    CommentsModule,
    UsersModule,
    AuthModule,
    SubCategoriesModule,
    UploadModule,
    CloudinaryModule,
    LikePostsModule,
    ReviewPostsModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}

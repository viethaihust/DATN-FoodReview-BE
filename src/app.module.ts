import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ReviewPostsModule } from './review-posts/review-posts.module';
import { NotificationModule } from './notification/notification.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtGuard } from './auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { LocationModule } from './location/location.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { ReadModule } from './read/read-posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    }),
    CategoriesModule,
    CommentsModule,
    UsersModule,
    AuthModule,
    UploadModule,
    CloudinaryModule,
    LikesModule,
    ReviewPostsModule,
    NotificationModule,
    BookmarkModule,
    LocationModule,
    ReadModule,
    FollowsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

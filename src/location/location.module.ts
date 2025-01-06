import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Location, LocationSchema } from './schema/location.schema';
import { JwtService } from '@nestjs/jwt';
import {
  ReviewPost,
  ReviewPostSchema,
} from 'src/review-posts/schema/reviewPost.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
      { name: ReviewPost.name, schema: ReviewPostSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [LocationService, JwtService],
})
export class LocationModule {}

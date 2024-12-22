import { Injectable } from '@nestjs/common';
import { CreateViewedDto } from './dto/createViewed.dto';
import { Viewed } from './schema/viewed.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ViewedService {
  constructor(
    @InjectModel(Viewed.name) private readonly viewedModel: Model<Viewed>,
  ) {}

  async markAsRead(createViewedDto: CreateViewedDto) {
    const { userId, postId } = createViewedDto;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingEntry = await this.viewedModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    if (!existingEntry) {
      return this.viewedModel.create({
        userId: objectIdUser,
        postId: objectIdPost,
      });
    }
    return existingEntry;
  }
}

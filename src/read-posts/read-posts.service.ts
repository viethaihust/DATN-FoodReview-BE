import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReadPost } from './schema/readPost.schema';
import { CreateReadPostDto } from './dto/createReadPost.dto';

@Injectable()
export class ReadPostsService {
  constructor(
    @InjectModel('ReadPost') private readonly readPostModel: Model<ReadPost>,
  ) {}

  async markAsRead(createReadPostDto: CreateReadPostDto) {
    const { userId, postId } = createReadPostDto;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingEntry = await this.readPostModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    if (!existingEntry) {
      return this.readPostModel.create({
        userId: objectIdUser,
        postId: objectIdPost,
      });
    }
    return existingEntry;
  }
}

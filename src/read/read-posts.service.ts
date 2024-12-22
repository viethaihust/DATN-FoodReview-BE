import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Read } from './schema/read.schema';
import { CreateReadDto } from './dto/createReadPost.dto';

@Injectable()
export class ReadService {
  constructor(
    @InjectModel(Read.name) private readonly readModel: Model<Read>,
  ) {}

  async markAsRead(createReadDto: CreateReadDto) {
    const { userId, postId } = createReadDto;
    const objectIdUser = new Types.ObjectId(userId);
    const objectIdPost = new Types.ObjectId(postId);

    const existingEntry = await this.readModel.findOne({
      userId: objectIdUser,
      postId: objectIdPost,
    });

    if (!existingEntry) {
      return this.readModel.create({
        userId: objectIdUser,
        postId: objectIdPost,
      });
    }
    return existingEntry;
  }
}

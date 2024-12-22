import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Read, ReadSchema } from './schema/read.schema';
import { ReadController } from './read-posts.controller';
import { ReadService } from './read-posts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Read.name, schema: ReadSchema }]),
  ],
  controllers: [ReadController],
  providers: [ReadService],
})
export class ReadModule {}

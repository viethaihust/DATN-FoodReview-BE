import { Module } from '@nestjs/common';
import { ViewedController } from './viewed.controller';
import { ViewedService } from './viewed.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Viewed, ViewedSchema } from './schema/viewed.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Viewed.name, schema: ViewedSchema }]),
  ],
  controllers: [ViewedController],
  providers: [ViewedService],
})
export class ViewedModule {}

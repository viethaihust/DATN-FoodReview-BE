import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from './schema/sub-category.schema';
import { Model } from 'mongoose';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly categoryModel: Model<SubCategory>,
  ) {}

  async findAll(): Promise<SubCategory[]> {
    return this.categoryModel.find().exec();
  }

  async findOneBySlug(slug: string): Promise<SubCategory> {
    return this.categoryModel.findOne({ slug }).exec();
  }
}

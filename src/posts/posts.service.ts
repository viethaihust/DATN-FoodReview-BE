import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './post.model';
import { CreatePostDto } from './dto/createPost.dto';
import { Category } from 'src/categories/category.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { category, ...rest } = createPostDto;

    const newPost = new this.postModel({
      ...rest,
      category: new Types.ObjectId(category),
    });
    return await newPost.save();
  }

  async findAll(
    queryParams: any,
  ): Promise<
    { posts: Post[]; totalPosts: number } | Post | { randomPosts: Post[] }
  > {
    const { id, categoryName, page = 1, pageSize = 5, random } = queryParams;

    if (id) {
      const post = await this.postModel
        .findById(id)
        .populate('category')
        .exec();
      if (!post) {
        throw new NotFoundException('Không tìm thấy bài post');
      }
      return post;
    }

    let query: any = {};
    if (categoryName) {
      const category = await this.categoryModel
        .findOne({ name: categoryName })
        .exec();
      if (!category) {
        throw new NotFoundException('Không tìm thấy category');
      }
      query = { category: category._id };
    }

    if (random && random.toLowerCase() === 'true') {
      const randomPosts = await this.postModel.aggregate([
        { $match: query },
        { $sample: { size: 4 } },
      ]);

      if (!randomPosts || randomPosts.length === 0) {
        throw new NotFoundException('Không tìm thấy random posts');
      }

      return { randomPosts };
    }

    const totalPosts = await this.postModel.countDocuments(query).exec();
    const posts = await this.postModel
      .find(query)
      .populate('category')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    if (!posts || posts.length === 0) {
      throw new NotFoundException('Không tìm thấy bài post nào');
    }

    return { posts, totalPosts };
  }
}

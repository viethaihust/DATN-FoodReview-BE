import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/createPost.dto';
import { FindAllPostsQueryDto } from './dto/findAllPost.dto';
import { Post } from './schema/post.schema';
import { Category } from 'src/categories/schema/category.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { category, ...rest } = createPostDto;

    const newPost = new this.postModel({
      ...rest,
      category: new Types.ObjectId(category),
    });
    return await newPost.save();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).populate('category').exec();
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài post');
    }
    return post;
  }

  async findAll(
    queryParams: FindAllPostsQueryDto,
  ): Promise<{ posts: Post[]; totalPosts: number } | { randomPosts: Post[] }> {
    const {
      categorySlug,
      page = 1,
      pageSize = 5,
      random,
    } = queryParams;

    let query: any = {};
    if (categorySlug) {
      const category = await this.categoryModel
        .findOne({ slug: categorySlug })
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

    return { posts, totalPosts };
  }
}

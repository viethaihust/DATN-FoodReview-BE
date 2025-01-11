import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { hash } from 'bcrypt';
import { User } from './schema/user.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { extractPublicId } from 'cloudinary-build-url';
import { CreateGoogleUserDto } from './dto/createGoogleUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.userModel
        .findOne({ email: dto.email })
        .exec();
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng');
      }

      const hashedPassword = await hash(dto.password, 10);
      const newUser = new this.userModel({
        ...dto,
        password: hashedPassword,
      });

      const result = await newUser.save();
      const { _id, email, name, image } = result.toObject();
      return { _id, email, name, image } as Omit<User, 'password'>;
    } catch (error) {
      throw new InternalServerErrorException(
        'Tạo user thất bại',
        error.message,
      );
    }
  }

  async createGoogleUser(
    dto: CreateGoogleUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.userModel
        .findOne({ email: dto.email })
        .exec();
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng');
      }

      const newUser = new this.userModel(dto);
      const result = await newUser.save();
      const { _id, email, name, image } = result.toObject();
      return { _id, email, name, image } as Omit<User, 'password'>;
    } catch (error) {
      throw new InternalServerErrorException(
        'Tạo user thất bại',
        error.message,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findUserProfileById(
    id: string,
  ): Promise<Omit<User, 'password'> | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findAllUsers(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);
    return { users, total };
  }

  async banUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { banned: true },
      { new: true },
    );
  }

  async unbanUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { banned: false },
      { new: true },
    );
  }

  async updateProfileImage(userId: string, image: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.image) {
      await this.cloudinaryService.deleteFile(
        extractPublicId(user.image),
        'image',
      );
    }

    user.image = image;
    return user.save();
  }
}

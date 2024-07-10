import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const existingUser = await this.userModel.findOne({ email: dto.email }).exec();
      if (existingUser) {
        throw new ConflictException('Email này đã được sử dụng');
      }

      const hashedPassword = await hash(dto.password, 10);
      const newUser = new this.userModel({
        ...dto,
        password: hashedPassword,
      });

      const result = await newUser.save();
      const { _id, email, name } = result.toObject();
      return { _id, email, name } as Omit<User, 'password'>;
    } catch (error) {
      throw new InternalServerErrorException('Tạo user thất bại', error.message);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
}

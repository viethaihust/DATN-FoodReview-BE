import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetAllUsersDto } from './dto/getAllUsers.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Roles('admin')
  @Get()
  async getAllUsers(@Query() getAllUsersDto: GetAllUsersDto) {
    const { page, pageSize } = getAllUsersDto;
    const pageNumber = +page || 1;
    const limitNumber = +pageSize || 10;
    const { users, total } = await this.usersService.findAllUsers(
      pageNumber,
      limitNumber,
    );

    return {
      users,
      page: pageNumber,
      pageSize: limitNumber,
      total,
    };
  }

  @Patch(':id/ban')
  async banUser(@Param('id') userId: string) {
    const user = await this.usersService.banUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User banned successfully' };
  }

  @Patch(':id/unban')
  async unbanUser(@Param('id') userId: string) {
    const user = await this.usersService.unbanUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User unbanned successfully' };
  }
}

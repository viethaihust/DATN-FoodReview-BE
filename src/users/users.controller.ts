import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }
}

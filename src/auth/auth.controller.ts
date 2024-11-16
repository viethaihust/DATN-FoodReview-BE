import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }

  @Roles('admin')
  @Get('protected')
  getAll(@Request() req) {
    return {
      messege: `Now you can access this protected API. this is your user email: ${req.user.email}`,
    };
  }
}

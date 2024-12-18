import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';
import { GoogleLoginDto } from './dto/googleLogin.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

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
  @Post('google-login')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return await this.authService.googleLogin(dto);
  }

  @Public()
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }

  @Public()
  @Post('send-magic-link')
  async sendMagicLink(@Query('email') email: string) {
    await this.authService.sendMagicLink(email);
    return { message: `Magic link sent to your email: ${email}` };
  }

  @Public()
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = changePasswordDto;

    if (!token || !password) {
      throw new BadRequestException('Token and password are required.');
    }

    const message = await this.authService.changePassword(changePasswordDto);
    return { message };
  }
}

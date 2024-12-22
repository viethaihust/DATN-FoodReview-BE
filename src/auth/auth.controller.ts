import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Query,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';
import { GoogleLoginDto } from './dto/googleLogin.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = forgotPasswordDto;

    if (!token || !password) {
      throw new BadRequestException('Token and password are required.');
    }

    const message = await this.authService.forgotPassword(forgotPasswordDto);
    return { message };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: any,
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as { _id: string };

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const { oldPassword, password } = resetPasswordDto;

    const message = await this.authService.resetPassword(
      decodedToken._id,
      oldPassword,
      password,
    );

    return { message };
  }
}

import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { RtGuard } from 'src/common/guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.authService.register(registerDto);
    return {
      statusCode: 200,
      message: 'Đăng ký thành công',
      data: newUser,
    };
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    return {
      statusCode: 200,
      message: 'Đăng nhập thành công',
      data: user,
    };
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('logout')
  async logout(@Request() req) {
    console.log(req.user);
    const result = await this.authService.logout(
      req.user.refreshToken as string,
    );
    return {
      statusCode: 200,
      message: 'Đăng xuất thành công',
      data: result,
    };
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    const result = await this.authService.refreshToken(req.user);
    return {
      statusCode: 200,
      message: 'Làm mới token thành công',
      data: result,
    };
  }
}

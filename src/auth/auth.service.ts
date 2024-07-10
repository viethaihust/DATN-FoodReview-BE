import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.model';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(dto: LoginDto): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }

    throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const payload = {
      email: user.email,
      sub: {
        name: user.name,
      },
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '20s',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_TOKEN_KEY,
    });

    return {
      user,
      backendTokens: {
        accessToken,
        refreshToken,
      },
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async refreshToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.sub,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '20s',
        secret: process.env.JWT_SECRET_KEY,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }
}

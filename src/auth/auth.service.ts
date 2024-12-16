import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schema/user.schema';
import { GoogleLoginDto } from './dto/googleLogin.dto';
import _ from 'lodash';

const EXPIRE_TIME = 30 * 60 * 60 * 24 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(dto: LoginDto): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user && user.banned) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }

    throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
  }

  async validateGoogleUser(
    dto: GoogleLoginDto,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user && user.banned) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }

    if (user) {
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      sub: {
        name: user.name,
      },
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1y',
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

  async googleLogin(dto: GoogleLoginDto) {
    let user = await this.validateGoogleUser(dto);

    if (!user) {
      const newUser = {
        name: dto.name,
        email: dto.email,
        password: '',
        image: dto.image,
      };
      user = await this.usersService.create(newUser);
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      sub: {
        name: user.name,
      },
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1y',
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
      _id: user._id,
      email: user.email,
      role: user.role,
      sub: user.sub,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_SECRET_KEY,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1y',
        secret: process.env.JWT_REFRESH_TOKEN_KEY,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schema/user.schema';
import { GoogleLoginDto } from './dto/googleLogin.dto';
import * as nodemailer from 'nodemailer';
import { ChangePasswordDto } from './dto/changePassword.dto';

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

  async sendMagicLink(email: string): Promise<void> {
    console.log(email);
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.jwtService.signAsync(
      { email: user.email },
      { secret: process.env.JWT_SECRET_KEY, expiresIn: '15m' },
    );

    const magicLink = `${process.env.FRONTEND_URL}/change-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Yêu cầu đổi mật khẩu',
      html: `<p>Click vào link bên dưới để đổi mật khẩu:</p>
             <a href="${magicLink}">${magicLink}</a>`,
    });
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<string> {
    const { token, password } = changePasswordDto;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const hashedPassword = await hash(password, 10);

      user.password = hashedPassword;
      await user.save();

      return 'Password changed successfully.';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token.');
    }
  }
}

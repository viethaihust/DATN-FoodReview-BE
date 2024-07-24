import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/schema/user.schema';
import { RegisterDto } from './dto/register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { omit } from 'lodash';
import { JwtPayloadWithRt, Token } from './types/jwtPayload.type';
import { RefreshToken } from './schema/refreshToken.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await hash(password, 10);
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    return await hash(refreshToken, 10);
  }

  private async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  private async signAccessToken(
    userId: string,
    email: string,
    name: string,
  ): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        name,
        type: Token.ACCESS,
      },
      {
        expiresIn: process.env.JWT_EXPIRES_IN as string,
        secret: process.env.JWT_SECRET_KEY as string,
      },
    );

    return accessToken;
  }

  private async signRefreshToken(
    userId: string,
    email: string,
    name: string,
    exp?: number,
  ): Promise<string> {
    // nếu có thời gian hết hạn thì sử dụng thời gian hết hạn đó nhằm đẩy vô database khi refresh token
    if (exp) {
      return await this.jwtService.signAsync(
        {
          sub: userId,
          email,
          name,
          type: Token.REFRESH,
          exp: exp,
        },
        {
          secret: process.env.JWT_REFRESH_TOKEN_KEY as string,
        },
      );
    }

    return await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        name,
        type: Token.REFRESH,
      },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
        secret: process.env.JWT_REFRESH_TOKEN_KEY as string,
      },
    );
  }

  private async decodeToken(token: string, secret: string) {
    return await this.jwtService.verifyAsync(token, {
      secret,
    });
  }

  private async validateUser(
    dto: LoginDto,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(dto.email);

    if (user && (await compare(dto.password, user.password))) {
      return omit<User, 'password'>(user.toObject(), 'password');
    }

    throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
  }

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userModel
      .findOne({ email: dto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // viết 1 đoạn code test lỗi 500 khi không có try catch
    // const test = 1;
    // if (test === 1) {
    //   throw new Error('Lỗi 500');
    // }
    const hashedPassword = await this.hashPassword(dto.password);
    const newUser = await new this.userModel({
      ...dto,
      password: hashedPassword,
    }).save();

    // return user bỏ đi password
    return omit(newUser.toObject(), 'password');
  }

  async login(dto: LoginDto): Promise<{
    user: Omit<User, 'password'>;
    backendTokens: { accessToken: string; refreshToken: string };
    expiresIn: number;
  }> {
    const user = await this.validateUser(dto);

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(String(user._id), user.email, user.name),
      this.signRefreshToken(String(user._id), user.email, user.name),
    ]);

    const [decodeAccessToken, decodeRefreshToken] = await Promise.all([
      this.decodeToken(accessToken, process.env.JWT_SECRET_KEY as string),
      this.decodeToken(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_KEY as string,
      ),
    ]);

    await new this.refreshTokenModel({
      refreshToken: refreshToken,
      userId: user._id,
      iat: new Date(decodeRefreshToken.iat * 1000),
      exp: new Date(decodeRefreshToken.exp * 1000),
    }).save();

    return {
      user,
      backendTokens: {
        accessToken,
        refreshToken,
      },
      expiresIn: decodeAccessToken.exp,

      // sai cách viết xem lại thời gian tạo token xong thì thời gian hết hạn là bao lâu
      // expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    // lấy ra refreshToken đã hash
    await this.refreshTokenModel.deleteOne({
      refreshToken: refreshToken,
    });
    return true;
  }

  async refreshToken(
    user: JwtPayloadWithRt,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // kiểm tra xem refreshToken có tồn tại trong database không
    const refreshToken = await this.refreshTokenModel
      .findOne({
        refreshToken: user.refreshToken,
      })
      .exec();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // lấy ra user
    const userFound = await this.userModel.findById(user.sub).exec();

    if (!userFound) {
      throw new UnauthorizedException('User không tồn tại');
    }

    // tạo lại accessToken và refreshToken mới
    const [accessToken, refreshTokenNew] = await Promise.all([
      this.signAccessToken(user.sub, user.email, user.name),
      this.signRefreshToken(user.sub, user.email, user.name, user.exp),
    ]);

    // xóa refreshToken cũ
    await this.refreshTokenModel.deleteOne({
      refreshToken: user.refreshToken,
    });

    const decodeRefreshToken = await this.decodeToken(
      refreshTokenNew,
      process.env.JWT_REFRESH_TOKEN_KEY as string,
    );

    console.log(decodeRefreshToken);

    // lưu refreshToken mới
    await new this.refreshTokenModel({
      refreshToken: refreshTokenNew,
      userId: user.sub,
      iat: new Date(decodeRefreshToken.iat * 1000),
      exp: new Date(decodeRefreshToken.exp * 1000),
    }).save();

    return {
      accessToken,
      refreshToken: refreshTokenNew,
    };
  }
}

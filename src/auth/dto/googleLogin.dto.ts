import { IsEmail, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

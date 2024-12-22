import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

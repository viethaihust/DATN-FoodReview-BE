import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGoogleUserDto {
  @IsString()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  image: string;
}

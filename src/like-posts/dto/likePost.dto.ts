import { IsString, IsNotEmpty } from 'class-validator';

export class LikePostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  postId: string;
}

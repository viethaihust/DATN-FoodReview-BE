import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  likes: number;

  @IsOptional()
  @IsString({ each: true })
  replies: string[];

  @IsNotEmpty()
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}

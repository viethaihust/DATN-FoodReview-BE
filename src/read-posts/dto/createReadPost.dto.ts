import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReadPostDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

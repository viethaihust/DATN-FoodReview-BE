import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateReadDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

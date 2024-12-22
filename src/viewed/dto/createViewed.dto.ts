import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateViewedDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

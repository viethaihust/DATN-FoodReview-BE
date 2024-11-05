import { IsMongoId } from 'class-validator';

export class CheckBookmarkStatusDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  postId: string;
}
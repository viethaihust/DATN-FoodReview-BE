import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateFollowDto {
  @IsNotEmpty()
  @IsMongoId()
  followerId: string;

  @IsNotEmpty()
  @IsMongoId()
  followingId: string;
}

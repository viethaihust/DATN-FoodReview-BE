import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CheckFollowStatusDto {
  @IsNotEmpty()
  @IsMongoId()
  followerId: string;

  @IsNotEmpty()
  @IsMongoId()
  followingId: string;
}

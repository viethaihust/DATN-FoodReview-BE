import { IsNotEmpty, IsString, IsMongoId, IsArray, IsOptional } from 'class-validator';

export class UpdateReviewPostDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsNotEmpty()
  files: Array<string>;

  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @IsMongoId()
  @IsNotEmpty()
  locationId: string;

  @IsOptional()
  ratings: {
    overall: number;
    flavor: number;
    space: number;
    hygiene: number;
    price: number;
    serves: number;
  };
}

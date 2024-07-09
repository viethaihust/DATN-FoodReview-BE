import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class FindAllPostsQueryDto {
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  random?: string;
}

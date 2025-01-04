import {
  IsString,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class LatLongDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LatLongDto)
  latLong?: LatLongDto;
}

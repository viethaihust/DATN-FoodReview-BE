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

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  province: string;

  @ValidateNested()
  @Type(() => LatLongDto)
  latLong: LatLongDto;
}

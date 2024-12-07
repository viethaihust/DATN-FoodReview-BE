import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocationDto } from './dto/createLocation.dto';
import { Model } from 'mongoose';
import { Location } from './schema/location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const newLocation = new this.locationModel(createLocationDto);
    return newLocation.save();
  }

  async search(query: string) {
    return this.locationModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } });
  }
}

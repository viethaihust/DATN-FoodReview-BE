import { Injectable, NotFoundException } from '@nestjs/common';
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
    const regex = new RegExp(query, 'i');
    return this.locationModel.find({ name: { $regex: regex } });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }
}

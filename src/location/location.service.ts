import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLocationDto } from './dto/createLocation.dto';
import { Model, Types } from 'mongoose';
import { Location } from './schema/location.schema';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { userId } = createLocationDto;
    const objectUserId = new Types.ObjectId(userId);

    const newLocation = new this.locationModel({
      ...createLocationDto,
      userId: objectUserId,
    });

    return newLocation.save();
  }

  async search(query: string) {
    const regex = new RegExp(query, 'i');
    return this.locationModel.find({
      $or: [{ name: { $regex: regex } }, { address: { $regex: regex } }],
    });
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }

  async findAll(
    page?: number,
    pageSize?: number,
  ): Promise<{ locations: Location[]; totalLocations: number }> {
    if (!page || !pageSize) {
      const locations = await this.locationModel.find().exec();
      const totalLocations = locations.length;
      return { locations, totalLocations };
    }

    const skip = (page - 1) * pageSize;

    const [locations, totalLocations] = await Promise.all([
      this.locationModel.find().skip(skip).limit(pageSize).exec(),
      this.locationModel.countDocuments().exec(),
    ]);

    return { locations, totalLocations };
  }

  async getUsersLocation(userId: string): Promise<Location[]> {
    const objectUserId = new Types.ObjectId(userId);
    return this.locationModel.find({ userId: objectUserId }).exec();
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
    userRole: string,
  ): Promise<Location> {
    const location = await this.locationModel.findById(id);

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.userId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        'You are not authorized to update this location',
      );
    }

    const updatedLocation = await this.locationModel.findByIdAndUpdate(
      id,
      { $set: updateLocationDto },
      { new: true },
    );

    return updatedLocation;
  }
}

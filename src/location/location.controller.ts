import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/createLocation.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { UpdateLocationDto } from './dto/updateLocation.dto';

@Controller('location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async createLocation(@Body() createLocationDto: CreateLocationDto) {
    const newLocation = await this.locationService.create(createLocationDto);
    return { success: true, result: newLocation };
  }

  @Public()
  @Get()
  async findAllLocations(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNumber = page ? Number(page) : undefined;
    const pageSizeNumber = pageSize ? Number(pageSize) : undefined;

    return this.locationService.findAll(pageNumber, pageSizeNumber);
  }

  @Public()
  @Get('search')
  async searchLocations(@Query('query') query: string) {
    return this.locationService.search(query);
  }

  @Get('user')
  async getUsersLocation(@Req() req: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      _id: string;
      role: string;
    };
    return this.locationService.getUsersLocation(decodedToken._id);
  }

  @Public()
  @Get(':id')
  async findOneLocation(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Req() req: any,
  ) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      _id: string;
      role: string;
    };
    return this.locationService.update(
      id,
      updateLocationDto,
      decodedToken._id,
      decodedToken.role,
    );
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string, @Req() req: any) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.jwtService.decode(token) as {
      _id: string;
      role: string;
    };

    return this.locationService.deleteLocation(
      id,
      decodedToken._id,
      decodedToken.role,
    );
  }
}

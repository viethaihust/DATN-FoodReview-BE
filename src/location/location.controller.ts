import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/createLocation.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Public()
  @Post()
  async createLocation(@Body() createLocationDto: CreateLocationDto) {
    const newLocation = await this.locationService.create(createLocationDto);
    return { success: true, result: newLocation };
  }

  @Public()
  @Get('search')
  async searchLocations(@Query('query') query: string) {
    return this.locationService.search(query);
  }
}

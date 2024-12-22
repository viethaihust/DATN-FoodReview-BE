import { Body, Controller, Post } from '@nestjs/common';
import { ViewedService } from './viewed.service';
import { CreateViewedDto } from './dto/createViewed.dto';

@Controller('viewed')
export class ViewedController {
  constructor(private readonly readService: ViewedService) {}

  @Post()
  async markAsRead(@Body() createViewedDto: CreateViewedDto) {
    return this.readService.markAsRead(createViewedDto);
  }
}

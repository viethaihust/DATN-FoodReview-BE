import { Body, Controller, Post } from '@nestjs/common';
import { ViewedService } from './viewed.service';
import { CreateViewedDto } from './dto/createViewed.dto';

@Controller('viewed')
export class ViewedController {
  constructor(private readonly viewedService: ViewedService) {}

  @Post()
  async markAsRead(@Body() createViewedDto: CreateViewedDto) {
    return this.viewedService.markAsRead(createViewedDto);
  }
}

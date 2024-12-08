import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Hello World - to check server is up & running',
  })
  @ApiResponse({
    status: 200,
    description: 'get Hello World response',
  })
  @ApiResponse({
    status: 500,
    description: 'something wrong - server is not up',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}

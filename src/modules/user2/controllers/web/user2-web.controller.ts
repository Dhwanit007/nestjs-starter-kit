import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';
import { User2Service } from '../../user2.service';

@Controller()
export class User2WebController {
  constructor(private user2Service: User2Service) {}

  @Get('/2')
  @UseGuards(AuthGuard)
  async getHello2(@Res() response: Response) {
    const ageChartData = await this.user2Service.getAgeChartData();
    const genderChartData = await this.user2Service.getGenderChartData();

    return response.render('home_2', {
      title: 'Home',
      page_title: 'Home',
      folder: 'General',
      message: 'Welcome to the Home Page',
      ageChartData,
      genderChartData,
    });
  }
}

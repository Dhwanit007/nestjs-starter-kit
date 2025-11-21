import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { TodosService } from '../todos/todos.service';
import { UserService } from '../user/user.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
    private todosService: TodosService,
  ) {}

  @Get('/')
  async getHome(@Res() response: Response, @Req() req: any) {
    const todos = await this.todosService.findAll();
    return response.render('index', {
      title: 'Home',
      page_title: 'Home',
      folder: 'General',
      message: 'Welcome to the Home Page',
      todos,
    });
  }

  @Get('pages-profile')
  renderProfile(@Res() res: Response) {
    return res.render('partials/pages-profile', {
      title: 'Profile',
      page_title: 'Profile',
      folder: 'General',
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  async getHello(@Res() response: Response, @Req() req: any) {
    const ageChartData = await this.userService.getAgeChartData();
    const genderChartData = await this.userService.getGenderChartData();

    return response.render('index', {
      title: 'Home',
      page_title: 'Home',
      folder: 'General',
      message: 'Welcome to the Home Page',
      ageChartData,
      genderChartData,
    });
  }
}

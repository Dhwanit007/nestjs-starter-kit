import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { DepartmentsService } from '../departments/departments.service';
import { EmployeeService } from '../employee/employee.service';
import { ProjectsService } from '../projects/projects.service';
import { TodosService } from '../todos/todos.service';
import { UserService } from '../user/user.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private userService: UserService,
    private todosService: TodosService,
    private employeeService: EmployeeService,
    private deptservice: DepartmentsService,
    private projectService: ProjectsService,
  ) {}

  @Get('/')
  async getHome(@Res() response: Response, @Req() req: any) {
    const todos = await this.todosService.findAll();
    const employeesCount = await this.employeeService.countAll();
    const usersCount = await this.userService.countAll();
    const departmentsCount = await this.deptservice.countAll();
    const projectsCount = await this.projectService.countAll();
    return response.render('index', {
      title: 'Home',
      page_title: 'Home',
      folder: 'General',
      message: 'Welcome to the Home Page',
      stats: {
        users: usersCount,
        employees: employeesCount,
        departments: departmentsCount,
        projects: projectsCount,
      },
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
    return response.render('index', {
      title: 'Home',
      page_title: 'Home',
      folder: 'General',
      message: 'Welcome to the Home Page',
    });
  }
}

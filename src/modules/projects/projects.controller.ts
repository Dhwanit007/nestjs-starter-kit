import { Controller, Get, Req, Res } from '@nestjs/common';

import { EmployeeService } from '../employee/employee.service';

@Controller('projects')
export class ProjectsController {
  constructor(private employeeService: EmployeeService) {}
  @Get()
  async getProjects(@Req() req, @Res() res) {
    return res.render('projects/projects', {
      title: 'Projects',
      page_title: 'Projects',
      folder: 'Projetcs',
      message: req.flash('toast'),
    });
  }     

  @Get('create')
  async createProject(@Req() req, @Res() res) {
    const employeesPaginated = await this.employeeService.getAllEmployees({
      page: 1,
      limit: 100,
      path: '/projects/create',
    });

    const employees = employeesPaginated.data;

    return res.render('projects/create', {
      title: 'Create Project',
      page_title: 'Create Project',
      folder: 'Projects',
      message: req.flash('toast'),
      employees,
    });
  }

  //   @Get()
  //   async showEmployees(
  //     @Req() req,
  //     @Res() res,
  //     @Paginate() query: PaginateQuery,
  //   ) {
  //     const employees = await this.employeeservice.getAllEmployees(query); // we’ll add this
  //     return res.render('user/employees', {
  //       title: 'Employees',
  //       user: req.user,
  //       employees,
  //       page_title: 'Employees',
  //       folder: 'Employee',
  //       message: req.flash('toast'),
  //     });
  //   }
}

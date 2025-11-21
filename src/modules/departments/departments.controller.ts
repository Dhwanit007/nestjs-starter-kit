import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { EmployeeService } from '../employee/employee.service';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private employeeService: EmployeeService,
  ) {}

  @Get()
  departmentsPage(@Res() res, @Req() req) {
    res.render('departments/department', {
      title: 'Departments',
      page_title: 'Departments',
      folder: 'Departments',
      message: {},
      error: {},
    });
  }

  @Get('create')
  async addDeptPage(@Req() req, @Res() res) {
    const employeesPaginated = await this.employeeService.getAllEmployees({
      page: 1,
      limit: 100,
      path: '/projects/create',
    });

    const employees = employeesPaginated.data;

    res.render('departments/create-department', {
      title: 'Create Department',
      page_title: 'Create Departement',
      folder: 'Departments',
      message: {},
      error: {},
      employees,
    });
  }

  @Post('create')
  create(@Body() body: CreateDepartmentDto) {
    return this.departmentsService.create(body);
  }

  @Get('all')
  async findAll() {
    const depts = await this.departmentsService.findAll2();
    return depts;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDepartmentDto) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}

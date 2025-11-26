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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeService } from 'src/modules/employee/employee.service';

import { DepartmentsService } from '../departments.service';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';

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
      message: req.flash('toast'),
      error: {},
    });
  }

  @Get('create')
  async addDeptPage(@Req() req, @Res() res) {
    // Fetch all employees
    // const employeesPaginated = await this.employeeService.getAllEmployees({
    //   page: 1,
    //   limit: 100,
    //   path: '/departments/create',
    // });
    const employees = await this.employeeService.getAllEmployeesWithDept();

    // const employees = employeesPaginated.data;

    // Filter employees who are not assigned to any department
    const availableEmployees = employees.filter((emp) => !emp.departmentId);
    console.log(availableEmployees);

    res.render('departments/create', {
      title: 'Create Department',
      page_title: 'Create Department',
      folder: 'Departments',
      message: req.flash('toast'),
      error: req.flash('error'),
      employees: availableEmployees,
    });
  }

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() body: CreateDepartmentDto, @Req() req, @Res() res) {
    await this.departmentsService.create(body);
    req.flash('toast', 'Department Created Sucessfully');
    return res.redirect('/departments');
  }

  @Get('all')
  async findAll() {
    const depts = await this.departmentsService.findAll();
    return depts;
  }

  @Get('api/:id')
  async getDept(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post('update/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateDepartmentDto,
    @Req() req,
    @Res() res,
  ) {
    await this.departmentsService.update(id, body);
    req.flash('toast', 'Department Updated Successfully');
    res.redirect('/departments');
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string, @Req() req, @Res() res) {
    await this.departmentsService.remove(id);
    req.flash('toast', 'Department Deleted Successfully');
    return res.redirect('/departments');
  }
}

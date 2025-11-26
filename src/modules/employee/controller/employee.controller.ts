import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { error } from 'console';
import type { PaginateQuery, Paginated } from 'nestjs-paginate';
import { Paginate } from 'nestjs-paginate';
import { title } from 'process';

import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.entity';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeservice: EmployeeService) {}

  @Get()
  async showEmployees(
    @Req() req,
    @Res() res,
    @Paginate() query: PaginateQuery,
  ) {
    const employees = await this.employeeservice.getAllEmployees(query); // we’ll add this
    return res.render('employees/index', {
      title: 'Employees',
      user: req.user,
      employees,
      page_title: 'Employees',
      folder: 'Employee',
      message: req.flash('toast'),
    });
  }

  @Get('all')
  async getAllEmployeesRaw(@Res() res) {
    const employees = await this.employeeservice.getallEmployees();
    return res.json({ data: employees });
  }

  @Get('newall')
  async getEmployee(
    @Paginate() query: PaginateQuery,
    @Res() res,
  ): Promise<any> {
    const emp: Paginated<Employee> =
      await this.employeeservice.getAllEmployees(query);
    // console.log(emp.data)
    return res.json({
      data: emp.data,
      recordsTotal: emp.meta.totalItems,
      recordsFiltered: emp.meta.totalItems,
    });
  }

  @Patch('restore/:id')
  async restoreEmployee(@Param('id') id: string, @Res() res) {
    console.log(id);
    const restored = await this.employeeservice.restore(id);
    if (!restored) {
      throw new HttpException(
        'Employee not found or not deleted',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.json({
      success: true,
      message: 'Employee restored successfully',
    });
  }

  @Get('deleted')
  async getDeletedEmployees(@Res() res) {
    res.render('user/restore', {
      title: 'Deleted Employees',
      page_title: 'Deleted Employees',
      folder: 'Employee',
    });
  }

  @Get('deleted/list')
  async getDeletedEmployeesList(@Res() res) {
    const employees = await this.employeeservice.findDeletedEmployees();

    return res.json({
      data: employees,
    });
  }

  // Create employee using
  // @Post('create')
  // @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  // async create(@Body() dto: CreateEmployeeDto, @Req() req, @Res() res) {
  //   const existing = await this.employeeservice.findByEmail(dto.email);
  //   if (existing) {
  //     req.flash('toast', { type: 'error', message: 'Email already exists' });
  //     req.flash('oldInput', dto);
  //     // console.log(req.flash('oldInput', res.body));
  //     res.redirect('/employee/create');
  //   }
  //   await this.employeeservice.create(dto);
  //   req.flash('toast', 'Employee Created Successfully');
  //   return res.redirect('/employee');
  // }

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEmployeeDto, @Req() req, @Res() res) {
    // First, check if email exists
    const existing = await this.employeeservice.findByEmail(dto.email);
    if (existing) {
      req.flash('toast', { type: 'error', message: 'Email already exists' });
      return res.redirect('/employee/create');
    }
    // If email doesn't exist, create employee
    await this.employeeservice.create(dto);
    req.flash('toast', {
      type: 'success',
      message: 'Employee Created Successfully',
    });
    return res.redirect('/employee');
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createpage(@Body() dto: CreateEmployeeDto, @Req() req, @Res() res) {
    // First, check if email exists
    const existing = await this.employeeservice.findByEmail(dto.email);
    if (existing) {
      req.flash('toast', { type: 'error', message: 'Email already exists' });
      return res.redirect('/register');
    }
    // If email doesn't exist, create employee
    await this.employeeservice.create(dto);
    req.flash('toast', {
      type: 'success',
      message: 'Employee Created Successfully',
    });
    return res.redirect('/login');
  }

  // Get register page
  @Get('create')
  async getCreateEmployeePage(@Req() req, @Res() res) {
    return res.render('employees/register', {
      title: 'Create Employee',
      user: req.user,
      page_title: 'Create Employee',
      folder: 'Employee',
      message: req.flash('toast'),
    });
  }

  // Delete employee
  @Post('delete/:id')
  async deleteEmployee(@Param('id') id: string, @Res() res, @Req() req) {
    await this.employeeservice.remove(id);
    req.flash('toast', 'Employee Deleted Successfully');
    return res.redirect('/employee');
  }

  // Update employee
  @Post('update/:id')
  async updateEmployee(@Param('id') id: string, @Req() req, @Res() res) {
    await this.employeeservice.update(id, req.body);
    req.flash('toast', 'Employee Updated Successfully');
    return res.redirect('/employee');
  }

  // Delete multiple employees
  @Post('delete-multiple')
  async deleteMultipleEmployees(
    @Body('ids') ids: string[],
    @Res() res,
    @Req() req,
  ) {
    await this.employeeservice.deleteMultiple(ids);
    req.flash('toast', 'Selected employees deleted successfully');
    return res.redirect('/employee');
  }
}

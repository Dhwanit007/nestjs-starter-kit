import {
  Body,
  Controller,
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
import type { PaginateQuery, Paginated } from 'nestjs-paginate';
import { Paginate } from 'nestjs-paginate';
import { title } from 'process';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

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
    return res.render('user/employees', {
      title: 'Employees',
      user: req.user,
      employees,
      page_title: 'Employees',
      folder: 'Employee',
      message: req.flash('toast'),
    });
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
    console.log(id)
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
  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEmployeeDto, @Req() req, @Res() res) {
    await this.employeeservice.create(dto);
    req.flash('toast', 'Employee Created Successfully');
    return res.redirect('/employee');
    // return { success: true, message: 'Employee created successfully' };
  }

  // Get register page
  @Get('create')
  async getCreateEmployeePage(@Req() req, @Res() res) {
    return res.render('user/register', {
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
    req.flash('toast', 'Employee deleted successfully');
    return res.redirect('/employee');
  }

  // Update employee
  @Post('update/:id')
  async updateEmployee(@Param('id') id: string, @Req() req, @Res() res) {
    await this.employeeservice.update(id, req.body);
    req.flash('toast', 'Employee updated successfully');
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

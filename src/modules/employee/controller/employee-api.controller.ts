import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { EmployeeSerialize } from '../dto/res/employee-res.dto';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.entity';

@Controller('api/employee')
@Serialize(EmployeeSerialize)
export class EmployeeApiController {
  constructor(private employeeservice: EmployeeService) {}

  @Get('newall')
  async getEmployee(
    @Paginate() query: PaginateQuery,
    @Res() res,
  ): Promise<any> {
    const emp: Paginated<Employee> =
      await this.employeeservice.getAllEmployees(query);
    return res.json(emp);
  }

  @Get('deleted/list')
  async getDeletedEmployeesList(@Res() res) {
    const employees = await this.employeeservice.findDeletedEmployees();

    return res.json(employees);
  }

  @Get('all')
  async getAllEmployeesRaw(@Res() res) {
    const employees = await this.employeeservice.getallEmployees();
    return res.json({ data: employees });
  }

  @Get('with-department')
  async getAllEmployeesWithDept() {
    return this.employeeservice.getAllEmployeesWithDept();
  }

  @Get()
  async getAllEmployees(@Paginate() query: PaginateQuery) {
    return this.employeeservice.getAllEmployees(query);
  }

  @Get('count/all')
  async countAll() {
    return this.employeeservice.countAll();
  }

  @Get('email/:email')
  async getEmployeeByEmail(@Param('email') email: string) {
    return this.employeeservice.getEmployeeByEmail(email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.employeeservice.remove(id);
  }

  @Delete()
  async removeMultiple(@Body('ids') ids: string[]) {
    return this.employeeservice.removeMultiple(ids);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body) {
    return this.employeeservice.update(id, body);
  }

  @Post('restore/:id')
  async restore(@Param('id') id: string) {
    return this.employeeservice.restore(id);
  }

  @Get('id/:id')
  async getById(@Param('id') id: string) {
    return this.employeeservice.getById(id);
  }

  @Post(':id/assign-department')
  async assignDepartment(
    @Param('id') id: string,
    @Body('departmentId') departmentId: string,
  ) {
    return this.employeeservice.assignDepartment(id, departmentId);
  }
}

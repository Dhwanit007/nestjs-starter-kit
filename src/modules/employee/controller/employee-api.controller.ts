import { Controller, Get, Res } from '@nestjs/common';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';

import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.entity';

@Controller('api/employee')
export class EmployeeApiController {
  constructor(private employeeservice: EmployeeService) {}

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

    @Get('deleted/list')
  async getDeletedEmployeesList(@Res() res) {
    const employees = await this.employeeservice.findDeletedEmployees();

    return res.json({
      data: employees,
    });
  }

}

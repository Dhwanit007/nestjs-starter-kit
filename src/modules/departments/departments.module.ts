import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeModule } from '../employee/employee.module';
import { DepartmentsApiController } from './controllers/department-api.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { DepartmentsService } from './departments.service';
import { Departments } from './entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departments]), EmployeeModule],
  providers: [DepartmentsService],
  controllers: [DepartmentsController, DepartmentsApiController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}

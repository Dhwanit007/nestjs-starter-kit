import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsModule } from '../projects/projects.module';
import { EmployeeApiController } from './controller/employee-api.controller';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), ProjectsModule],
  providers: [EmployeeService],
  controllers: [EmployeeController, EmployeeApiController],
  exports: [EmployeeService],
})
export class EmployeeModule {}

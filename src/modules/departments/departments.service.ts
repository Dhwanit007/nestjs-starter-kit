import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeService } from '../employee/employee.service';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { Departments } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Departments)
    private departmentRepo: Repository<Departments>,

    private employeeService: EmployeeService,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const department = this.departmentRepo.create(dto);
    return this.departmentRepo.save(department);
  }

  async findAll2() {
    const departments =await this.departmentRepo.find();

    const result: any = [];

    for (const dept of departments) {
      const ids = Array.isArray(dept.assignedEmployeeIds)
        ? dept.assignedEmployeeIds
        : dept.assignedEmployeeIds
          ? [dept.assignedEmployeeIds]
          : [];

      const employees = await Promise.all(
        ids.map((id) => this.employeeService.getById2(id)),
      );

      result.push({
        ...dept,
        assignedEmployees: employees.filter((e) => e),
      });
    }

    return result
  }

  async findAll() {
    const departments = await this.departmentRepo.find();

    const result: any = [];

    for (const dept of departments) {
      const ids = Array.isArray(dept.assignedEmployeeIds)
        ? dept.assignedEmployeeIds
        : dept.assignedEmployeeIds
          ? [dept.assignedEmployeeIds]
          : [];

      const employees = await Promise.all(
        ids.map((id) => this.employeeService.getById(id)),
      );

      result.push({
        ...dept,
        assignedEmployees: employees.filter((e) => e),
      });
    }

    return result;
  }

  async findOne(id: string) {
    return this.departmentRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.departmentRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.departmentRepo.softDelete(id);
    return { deleted: true };
  }
}

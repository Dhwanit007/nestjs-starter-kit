import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
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
    private readonly departmentRepo: Repository<Departments>,
    @Inject(forwardRef(() => EmployeeService))
    private readonly employeeService: EmployeeService,
  ) {}

  async countAll() {
    return this.departmentRepo.count();
  }

  async create(dto: CreateDepartmentDto) {
    const dept = this.departmentRepo.findOne({ where: { name: dto.name } });
    if (!dept) {
      const department = this.departmentRepo.create({
        name: dto.name,
        description: dto.description,
        // assignedEmployeeIds: dto.assignedEmployeeIds || [],
      });

      const savedDept = await this.departmentRepo.save(department);
      return savedDept;
    } else {
      throw new BadRequestException('Department already exists!');
    }
  }

  async assignEmployees(deptId: string, employeeIds: string[]) {
    const department = await this.departmentRepo.findOne({
      where: { id: deptId },
    });

    if (!department) throw new BadRequestException('Department not found');

    for (const empId of employeeIds) {
      const employee = await this.employeeService.getById(empId);

      if (!employee) continue;
      if (employee.department?.id) {
        throw new BadRequestException(
          `${employee.name} is already assigned to a department`,
        );
      }

      // Assign employee to this department
      await this.employeeService.assignDepartment(empId, deptId);
    }

    return this.findOne(deptId);
  }

  async findAll() {
    const departments = await this.departmentRepo.find();
    const result: any[] = [];

    // for (const dept of departments) {
    //   const employees = await Promise.all(
    //     (dept.assignedEmployeeIds || []).map((id) =>
    //       this.employeeService.getByIdSafe(id),
    //     ),
    //   );

    //   result.push({
    //     ...dept,
    //     assignedEmployees: employees.filter(Boolean),
    //   });
    // }

    return departments;
  }

  async findOne(id: string) {
    return this.departmentRepo.findOne({ where: { id } });
  }

  // async update(id: string, dto: UpdateDepartmentDto) {
  //   await this.departmentRepo.update(id, dto);

  //   if (dto.assignedEmployeeIds?.length) {
  //     await this.assignEmployees(id, dto.assignedEmployeeIds);
  //   }

  //   return this.findOne(id);
  // }

  async update(id: string, dto: UpdateDepartmentDto) {
    // 1. Update the department details
    await this.departmentRepo.update(id, dto);

    // const selectedIds = dto.assignedEmployeeIds || [];

    // 2. Pehle se jo is department me employees assigned hai
    // const existingEmployees = await this.employeeService.findByDepartment(id);
    // const existingIds = existingEmployees.map((e) => e.id);

    // 3. Jo selected me nahi hai → unko null karo
    // const unselectedIds = existingIds.filter(
    //   (eId) => !selectedIds.includes(eId),
    // );

    // if (unselectedIds.length > 0) {
    //   await this.employeeService.removeDepartmentFromEmployees(unselectedIds);
    // }

    // // 4. Selected employees ko department assign karo
    // if (selectedIds.length > 0) {
    //   await this.employeeService.assignDepartmentToEmployees(id, selectedIds);
    // }

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.departmentRepo.softDelete(id);
  }
}

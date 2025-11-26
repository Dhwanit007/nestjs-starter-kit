import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Paginate, Paginated, paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { In, IsNull, Not, Repository } from 'typeorm';
import { promisify } from 'util';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

const scrypt = promisify(crypto.scrypt);
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) private emprepo: Repository<Employee>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async findByEmail(email: string) {
    return this.emprepo.findOne({ where: { email } });
  }

  async getAllEmployeesWithDept(): Promise<Employee[]> {
    return this.emprepo.find({
      relations: ['department'], // <--- load department relation
    });
  }

  async getAllEmployees(query?: PaginateQuery): Promise<any> {
    const qb = this.emprepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department'); // join department

    if (!query) {
      return qb.getMany();
    }

    return paginate(query, qb, {
      sortableColumns: [
        'id',
        'name',
        'created_at',
        'role',
        'email',
        'department.name',
      ],
      searchableColumns: ['name', 'email', 'department.name'], // optional
      defaultLimit: 10,
    });
  }

  async countAll() {
    return await this.emprepo.count();
  }

  async create(dto: CreateEmployeeDto) {
    const existing = await this.emprepo.findOne({
      where: { email: dto.email },
    });
    // if (existing) {
    //   throw new BadRequestException('Email already Exists');
    // }
    if (existing) {
      return null; // or false
    }
    // hash password
    const hashedPassword = await this.hashPassword(dto.password);
    const employee = this.emprepo.create({ ...dto, password: hashedPassword });
    return await this.emprepo.save(employee);
  }

  async getEmployeeByEmail(email: string) {
    return this.emprepo.findOne({ where: { email } });
  }

  async getallEmployees(): Promise<Employee[]> {
    return this.emprepo.find();
  }

  async remove(id: string) {
    return await this.emprepo.softDelete(id);
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const user = await this.emprepo.findOne({ where: { id } });
    // console.log(user);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const existing = await this.emprepo.findOne({
      where: { email: dto.email },
    });
    // if (existing) {
    //   throw new BadRequestException('Email already Exists');
    // }
    if (existing) {
      return null; // or false
    }
    Object.assign(user, dto);
    return await this.emprepo.save(user);
  }

  async restore(id: string) {
    const employee = this.emprepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!employee) {
      throw new NotFoundException('ID not found');
    }
    await this.emprepo.restore(id);
    return true;
  }

  async getById(id: string): Promise<Employee> {
    const employee = await this.emprepo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException(`User with id ${id} not found`);
    return employee;
  }

  async assignDepartment(employeeId: string, deptId: string) {
    const employee = await this.getById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    employee.department = { id: deptId } as any; // Set department reference
    return this.emprepo.save(employee);
  }

  async getByIdSafe(id: string): Promise<{ id: string; name: string } | null> {
    const employee = await this.emprepo.findOne({ where: { id } });
    if (!employee) return null;
    return { id: employee.id, name: employee.name };
  }

  async getById2(id: string) {
    const employee = await this.emprepo.findOne({ where: { id } });
    if (!employee) return null;
    return { id: employee.id, name: employee.name }; // must have `name`
  }

  async changeRole(uuid: string, role: 'Admin' | 'Manager' | 'Employee') {
    const employee = await this.getById(uuid);
    employee.role = role;
    return await this.emprepo.save(employee);
  }

  async findDeletedEmployees(): Promise<Employee[]> {
    return this.emprepo.find({
      withDeleted: true,
      where: { deleted_at: Not(IsNull()) },
    });
  }

  async removeMultiple(ids: string[]) {
    await this.emprepo.softDelete({ id: In(ids) });
  }

  async registeremployee(dto: CreateEmployeeDto) {
    const hashedPassword = await this.hashPassword(dto.password);
    return this.create({ ...dto, password: hashedPassword });
  }

  async deleteMultiple(ids: string[]) {
    await this.emprepo.softDelete({ id: In(ids) });
  }
}

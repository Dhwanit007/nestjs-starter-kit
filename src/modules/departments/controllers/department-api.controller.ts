import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { DepartmentsService } from '../departments.service';
import { CreateDepartmentDto } from '../dtos/create-department.dto';
import { DepartmentListDto } from '../dtos/res/department-list.dto';
import { UpdateDepartmentDto } from '../dtos/update-department.dto';

@Controller('api/department')
@Serialize(DepartmentListDto)
export class DepartmentsApiController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // GET /api/department/count
  @Get('count')
  async countAll() {
    return this.departmentsService.countAll();
  }

  // POST /api/department
  @Post()
  async create(@Body() dto: CreateDepartmentDto) {
    const dept = await this.departmentsService.findOne(dto.name);

    return this.departmentsService.create(dto);
  }

  // GET /api/department
  @Get()
  async findAll() {
    return this.departmentsService.findAll();
  }

  // GET /api/department/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  // PATCH /api/department/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  // DELETE /api/department/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  // PATCH /api/department/:id/assign
  @Patch(':id/assign')
  async assignEmployees(
    @Param('id') id: string,
    @Body('employeeIds') employeeIds: string[],
  ) {
    return this.departmentsService.assignEmployees(id, employeeIds);
  }
}

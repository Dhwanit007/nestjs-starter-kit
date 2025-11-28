import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeService } from '../employee/employee.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Projects } from './entities/projects.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Projects)
    private projectsRepository: Repository<Projects>,
    private employeeService: EmployeeService,
  ) {}

  async createProject(dto: CreateProjectDto): Promise<Projects> {
    // Create a proper Projects instance and copy DTO values to avoid incorrect
    // type inference (repo.create can infer arrays in some overloads).
    const project = this.projectsRepository.create();
    Object.assign(project, dto as any);
    if ((dto as any).deadline) {
      project.deadline = new Date((dto as any).deadline);
    }

    return this.projectsRepository.save(project);
  }

  async getall(): Promise<Projects[]> {
    const projects = this.projectsRepository.find();
    if (!projects) {
      throw new NotFoundException();
    }
    return projects;
  }

  // async findAllProjects() {
  //   const projects = await this.projectsRepository.find();

  //   const result: any = [];

  //   for (const project of projects) {
  //     //   let employees: any = [];

  //     //   if (Array.isArray(project.assignedEmployeeIds)) {
  //     //     employees = await Promise.all(
  //     //       project.assignedEmployeeIds.map(async (empId) => {
  //     //         const emp = await this.employeeService.getById(empId);
  //     //         return emp ? { id: emp.id, name: emp.name } : null;
  //     //       }),
  //     //     );

  //     //     employees = employees.filter(Boolean);
  //     //   }

  //     const ids = Array.isArray(project.assignedEmployeeIds)
  //       ? project.assignedEmployeeIds
  //       : [project.assignedEmployeeIds]; // normalize

  //     const employees = await Promise.all(
  //       ids.map((id) => this.employeeService.getById(id)),
  //     );

  //     result.push({
  //       ...project,
  //       assignedEmployees: employees,
  //     });
  //   }
  //   return result;
  // }

  async findAllProjects() {
    const projects = await this.projectsRepository.find();

    const result: any = [];

    for (const project of projects) {
      const ids = Array.isArray(project.assignedEmployeeIds)
        ? project.assignedEmployeeIds
        : project.assignedEmployeeIds
          ? [project.assignedEmployeeIds]
          : [];

      const employees = await Promise.all(
        ids.map(async (id) => {
          try {
            const emp = await this.employeeService.getById(id);
            return { id: emp.id, name: emp.name };
          } catch (err) {
            // Ignore missing employees
            return null;
          }
        }),
      );

      // Build a plain object to avoid including ORM relations (which can
      // introduce circular references) and only return the fields needed
      // by the API / client.
      result.push({
        ...project,
      });
    }

    return result;
  }

  async countAll() {
    return await this.projectsRepository.count();
  }

  async getProjectByName(name: string) {
    return await this.projectsRepository.findBy({ name });
  }

  async getProjectById(id: string): Promise<Projects> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project Not Found');
    }
    return project;
  }

  async deleteProject(id: string): Promise<any> {
    const result = await this.projectsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Project Not Found');
    }
    return { message: 'Project Deleted Successfully' };
  }

  // async updateProject(id: string, dto: UpdateProjectDto): Promise<Projects> {
  //   const project = await this.getProjectById(id);
  //   Object.assign(project, dto);
  //   return this.projectsRepository.save(project);
  // }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Projects> {
    const project = await this.getProjectById(id);

    // Update basic fields
    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;

    // Update status if provided
    if (dto.status !== undefined) project.status = dto.status;

    // Update deadline if provided
    if (dto.deadline !== undefined) {
      project.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }

    // VERY IMPORTANT: Update employee IDs array properly
    if (dto.assignedEmployeeIds !== undefined) {
      project.assignedEmployeeIds = Array.isArray(dto.assignedEmployeeIds)
        ? dto.assignedEmployeeIds
        : [dto.assignedEmployeeIds];
    }

    return this.projectsRepository.save(project);
  }

  async getProjectsByEmployeeId(employeeId: string): Promise<Projects[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .where(':employeeId = ANY(project.assignedEmployeeIds)', { employeeId })
      .getMany();
  }

  async assignEmployeeToProject(
    projectId: string,
    employeeId: string,
  ): Promise<Projects> {
    const project = await this.getProjectById(projectId);

    project.assignedEmployeeIds = project.assignedEmployeeIds || [];

    if (!project.assignedEmployeeIds.includes(employeeId)) {
      project.assignedEmployeeIds.push(employeeId);
    }

    return this.projectsRepository.save(project);
  }
}

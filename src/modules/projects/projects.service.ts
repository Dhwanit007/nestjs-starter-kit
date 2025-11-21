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
    const project = this.projectsRepository.create(dto);
    return this.projectsRepository.save(project);
  }

  //   async findAllProjects(): Promise<Projects[]> {
  //     return this.projectsRepository.find();
  //   }

  async findAllProjects() {
    const projects = await this.projectsRepository.find();

    const result: any = [];

    for (const project of projects) {
      //   let employees: any = [];

      //   if (Array.isArray(project.assignedEmployeeIds)) {
      //     employees = await Promise.all(
      //       project.assignedEmployeeIds.map(async (empId) => {
      //         const emp = await this.employeeService.getById(empId);
      //         return emp ? { id: emp.id, name: emp.name } : null;
      //       }),
      //     );

      //     employees = employees.filter(Boolean);
      //   }

      const ids = Array.isArray(project.assignedEmployeeIds)
        ? project.assignedEmployeeIds
        : [project.assignedEmployeeIds]; // normalize

      const employees = await Promise.all(
        ids.map((id) => this.employeeService.getById(id)),
      );

      result.push({
        ...project,
        assignedEmployees: employees,
      });
    }
    return result;
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

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Projects> {
    const project = await this.getProjectById(id);
    Object.assign(project, dto);
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

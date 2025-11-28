import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeService } from 'src/modules/employee/employee.service';

import { CreateProjectDto } from '../dtos/create-project.dto';
import { Status } from '../entities/projects.entity';
import { ProjectsService } from '../projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private employeeService: EmployeeService,
    private projectService: ProjectsService,
  ) {}
  @Get()
  async getProjects(@Req() req, @Res() res) {
    return res.render('projects/index', {
      title: 'Projects',
      page_title: 'Projects',
      folder: 'Projetcs',
      message: req.flash('toast'),
      statusOptions: Object.values(Status),
      error: {},
    });
  }

  @Get('create')
  async createProject(@Req() req, @Res() res) {
    const employeesPaginated = await this.employeeService.getAllEmployees({
      page: 1,
      limit: 100,
      path: '/projects/create',
    });

    const employees = employeesPaginated.data;

    return res.render('projects/create', {
      title: 'Create Project',
      page_title: 'Create Project',
      folder: 'Projects',
      message: req.flash('toast'),
      employees,
    });
  }

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateProjectDto, @Req() req, @Res() res) {
    const exists = await this.projectService.getProjectByName(dto.name);
    // console.log(dto.name);
    // console.log(exists);
    if (!exists) {
      // console.log(dto);
      await this.projectService.createProject(dto);
      req.flash('toast', 'Project Created Successfully');
      return res.redirect('/projects');
    } else {
      req.flash('toast', { type: 'error', message: 'Project Already Exists' });
      res.redirect('/projects');
    }
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Req() req, @Res() res) {
    await this.projectService.deleteProject(id);
    req.flash('toast', 'Project Deleted Successfully');
    res.redirect('/projects');
  }
}

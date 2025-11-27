import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';

import { CreateProjectDto } from '../dtos/create-project.dto';
import { ProjectListDto } from '../dtos/res/project-list.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { ProjectsService } from '../projects.service';

@Controller('api/projects')
@Serialize(ProjectListDto)
export class ProjectApiController {
  constructor(private projectService: ProjectsService) {}

  @Get('getall')
  async getAll(@Req() req, @Res() res) {
    const projects = await this.projectService.findAllProjects();
    // console.log(projects);
    return res.json({ data: projects });
  }

  @Get('newall')
  async get() {
    const projects = this.projectService.getall();
    return projects;
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @Req() req,
  ) {
    const updated = await this.projectService.updateProject(id, body);
    req.flash('toast', 'Project Updated Successfully');
    return { message: 'Project Updated Successfully', data: updated };
  }

  // Delete('delete/:id')
  @Delete('delete/:id')
  async delete(@Param('id') id: string, @Req() req) {
    await this.projectService.deleteProject(id);
    req.flash('toast', 'Project Deleted Successfully');
    return { message: 'Project Deleted Successfully' };
  }

  // -----------------------------
  // CREATE PROJECT
  // -----------------------------
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projectService.createProject(dto);
    return { message: 'Project Created Successfully', data: project };
  }

  // -----------------------------
  // GET ONE PROJECT
  // -----------------------------
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const project = await this.projectService.getProjectById(id);
    return { data: project };
  }

  // -----------------------------
  // UPDATE PROJECT
  // -----------------------------
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update2(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @Req() req,
  ) {
    const updated = await this.projectService.updateProject(id, body);
    req.flash('toast', 'Project Updated Successfully');
    return { message: 'Project Updated Successfully', data: updated };
  }

  // -----------------------------
  // DELETE PROJECT
  // -----------------------------
  @Delete(':id')
  async delete2(@Param('id') id: string) {
    const project = await this.projectService.getProjectById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.projectService.deleteProject(id);
    return { message: 'Project Deleted Successfully' };
  }

  // -----------------------------
  // ASSIGN EMPLOYEE TO PROJECT
  // -----------------------------
  @Patch(':projectId/assign/:empId')
  async assignEmployee(
    @Param('projectId') projectId: string,
    @Param('empId') employeeId: string,
  ) {
    const updated = await this.projectService.assignEmployeeToProject(
      projectId,
      employeeId,
    );

    return {
      message: 'Employee Assigned to Project Successfully',
      data: updated,
    };
  }
}

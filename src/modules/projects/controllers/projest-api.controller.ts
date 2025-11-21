import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';

import { CreateProjectDto } from '../dtos/create-project.dto';
import { ProjectsService } from '../projects.service';

@Controller('api/projects')
export class ProjectApiController {
  constructor(private projectService: ProjectsService) {}

  @Post('create')
  async create(@Body() dto: CreateProjectDto, @Req() req, @Res() res) {
    console.log(dto)
    await this.projectService.createProject(dto);
    req.flash('toast', 'Project Created Successfully');
    return res.redirect('/projects');
  }

  @Get('getall')
  async getAll(@Req() req, @Res() res) {
    const projects = await this.projectService.findAllProjects();
    // console.log(projects)
    return res.json(projects);
  }

  
}

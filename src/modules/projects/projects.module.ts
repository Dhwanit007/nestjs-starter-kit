import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeModule } from '../employee/employee.module';
import { ProjectApiController } from './controllers/project-api.controller';
import { Projects } from './entities/projects.entity';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projects]),
    forwardRef(() => EmployeeModule),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController, ProjectApiController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

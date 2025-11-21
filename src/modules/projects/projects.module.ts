import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeModule } from '../employee/employee.module';
import { ProjectApiController } from './controllers/projest-api.controller';
import { Projects } from './entities/projects.entity';
import { ProjectsController } from './projects.controller';
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

import {
  Body,
  Patch,
  Controller,
  Param,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { User2Service } from '../../user2.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('/api/user2')
@UseGuards(AuthGuard)
export class User2ApiController {
  constructor(private user2Service: User2Service) {}

  @Get()
  async getUserPaginated(@Paginate() query: PaginateQuery) {
    return this.user2Service.getUserPaginate(query);
  }

  @Patch('/:id')
  async updateUser(@Body() input: UpdateUserDto, @Param('id') id: string) {
    return this.user2Service.updateUser2(id, input);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.user2Service.deleteUser(id);
  }
}

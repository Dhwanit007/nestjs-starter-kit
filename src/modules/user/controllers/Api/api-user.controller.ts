import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

import { Serialize } from '../../../../common/interceptors/serialize.interceptor';
import { CreateUserDto } from '../../dto/request/create-user.dto';
import { UpdateUserDto } from '../../dto/request/update-user.dto';
import { UserDto } from '../../dto/response/user.dto';
import { UserService } from '../../user.service';

@Controller('/api/users')
@UseGuards(JwtAuthGuard)
export class ApiUserController {
  constructor(private userService: UserService) {}
  @Get()
  // @Serialize()
  async getUserList(@Paginate() query: PaginateQuery) {
    const result = await this.userService.find(query);
    return {
      message: 'Users List Fetched Successfully',
      payload: {
        ...result,
        data: plainToInstance(UserDto, result.data, {
          excludeExtraneousValues: true,
        }),
      },
    };
  }

  @Get('/:id')
  @Serialize(UserDto)
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));
    if (!user) throw new NotFoundException('User not found!');
    return { message: 'User Details Fetched Successfully', payload: user };
  }

  @Post()
  @Serialize(UserDto)
  createUser(@Body() createUserDto: CreateUserDto) {
    const data = {
      name: createUserDto.name,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber,
      password: createUserDto.password,
    };
    return this.userService.create(data);
  }

  @Put('/:id')
  @Serialize(UserDto)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = {
      email: updateUserDto.email,
      phoneNumber: updateUserDto.phoneNumber,
      name: updateUserDto.name,
    };
    return this.userService.update(parseInt(id), data);
  }

  @Delete('/:id')
  @Serialize(UserDto)
  deleteUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}

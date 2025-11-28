/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { PaginateQuery } from 'nestjs-paginate';

import { AuthGuard } from '../../../../common/guards/auth.guard';
import { CreateUserDto } from '../../dto/request/create-user.dto';
import { UpdateUserDto } from '../../dto/request/update-user.dto';
import { UserDto } from '../../dto/response/user.dto';
import { UserService } from '../../user.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUserList(
    @Req() request: Request,
    @Query() query: PaginateQuery,
    @Res() res: Response,
  ) {
    const isAjax =
      request.xhr ||
      request.headers['accept']?.includes('application/json') ||
      request.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isAjax) {
      const result = await this.userService.find(query);

      return res.json(result);
    }
    return res.render('user/index', {
      title: 'User List',
      page_title: 'User DataTable',
      folder: 'User',
    });
  }

  @Get('/create')
  createUserView(@Req() req: Request, @Res() res: Response) {
    return res.render('user/create', {
      title: 'Create User',
      page_title: 'Create User',
      folder: 'User',
      errors: {},
      old: null,
    });
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findOne(parseInt(id));

    if (!user) return res.redirect('/users');

    return res.render('user/show', {
      title: 'User Detail',
      page_title: 'User Detail',
      folder: 'User',
      user: plainToInstance(UserDto, user),
    });
  }

  @Get('/:id/edit')
  async editUserById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.userService.findOne(parseInt(id));

    if (!user) throw new NotFoundException('User not found!');

    return res.render('user/edit', {
      title: 'Edit User',
      page_title: 'Edit User',
      folder: 'User',
      user: plainToInstance(UserDto, user),

      errors: req.flash('errors')[0] || {},

      old: req.flash('old')[0] || null,
    });
  }

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const exists = await this.userService.findOneByEmail(body.email);
    if (exists) {
      req.flash('toast', { type: 'error', message: 'Email Already Exists' });
      res.redirect('/users/create');
    }

    await this.userService.create(body);
    req.flash('toast', 'User Created Successfully');
    return res.redirect('/users');
  }

  @Put('/:id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = {
      email: updateUserDto.email,
      phoneNumber: updateUserDto.phoneNumber,
      name: updateUserDto.name,
    };
    this.userService.update(parseInt(id), data);
    req.flash('toast', 'User Edited Successfully');
    res.redirect('/users');
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.userService.remove(parseInt(id));
    req.flash('toast', 'User Deleted Successfully');
    res.redirect('/users');
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  Res,
  Req,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from '../../dto/request/update-user.dto';
import { UserService } from '../../user.service';
import { UserDto } from '../../dto/response/user.dto';
import { PaginateQuery } from 'nestjs-paginate';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../../../guards/auth.guard';

import { Request, Response } from 'express';
import { CreateUserDto } from '../../dto/request/create-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async getUserList(
    @Req() request: Request,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const isAjax =
      request.xhr ||
      request.headers['accept']?.includes('application/json') ||
      request.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isAjax) {
      // Parse the flattened DataTables query parameters
      const parsedQuery = this.parseDataTablesQuery(query);
      console.log(
        'Parsed DataTables query:',
        JSON.stringify(parsedQuery, null, 2),
      );

      const { start, length, search, order, columns, draw, path } = parsedQuery;

      // Calculate page number
      const page =
        start && length ? Math.floor(Number(start) / Number(length)) + 1 : 1;
      const limit = length ? Number(length) : 10;

      // Build sortBy array
      const sortBy: [string, 'ASC' | 'DESC'][] = [];
      if (order && columns) {
        order.forEach((ord: any) => {
          const colIdx = ord.column;
          const colName = columns[colIdx]?.data;
          const dir =
            ord.dir && ord.dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
          if (colName && colName !== '') sortBy.push([colName, dir]);
        });
      }

      // Global search
      const searchValue = search?.value || '';

      console.log('Final parsed values:', {
        page,
        limit,
        sortBy,
        searchValue,
      });

      // Build paginate query
      const paginateQuery: PaginateQuery = {
        path,
        page,
        limit,
        sortBy,
        search: searchValue,
        filter: {},
      };

      const result = await this.userService.find(paginateQuery);

      const data = {
        draw: draw ? Number(draw) : 1,
        recordsTotal: result.meta.totalItems,
        recordsFiltered: result.meta.totalItems,
        data: result.data,
      };
      return res.json(data);
    }
    return res.render('user/index', {
      title: 'User List',
      page_title: 'User DataTable',
      folder: 'User',
    });
  }

  private parseDataTablesQuery(query: any) {
    const parsed = {
      path: query.path,
      draw: query.draw,
      start: query.start,
      length: query.length,
      search: {
        value: query['search[value]'] || '',
        regex: query['search[regex]'] === 'true',
      },
      order: [] as any[],
      columns: [] as any[],
    };

    // Parse columns
    let columnIndex = 0;
    while (query[`columns[${columnIndex}][data]`] !== undefined) {
      parsed.columns[columnIndex] = {
        data: query[`columns[${columnIndex}][data]`] || '',
        name: query[`columns[${columnIndex}][name]`] || '',
        searchable: query[`columns[${columnIndex}][searchable]`] === 'true',
        orderable: query[`columns[${columnIndex}][orderable]`] === 'true',
        search: {
          value: query[`columns[${columnIndex}][search][value]`] || '',
          regex: query[`columns[${columnIndex}][search][regex]`] === 'true',
        },
      };
      columnIndex++;
    }

    // Parse order
    let orderIndex = 0;
    while (query[`order[${orderIndex}][column]`] !== undefined) {
      parsed.order[orderIndex] = {
        column: parseInt(query[`order[${orderIndex}][column]`]),
        dir: query[`order[${orderIndex}][dir]`] || 'asc',
      };
      orderIndex++;
    }

    return parsed;
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

  @Put('/:id/update')
  async updateUserById(
    @Param('id') id: string,
    @Body()
    body: {
      name: string | undefined;
      email: string | undefined;
      phoneNumber: string | undefined;
    },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const errors: Array<object> = [];
      if (body.name === '') {
        errors.push({ name: 'Name should not be empty' });
      }
      if (body.email === '') {
        errors.push({ email: 'Email should not be empty' });
      }
      if (body.phoneNumber === '') {
        errors.push({ phoneNumber: 'Phone Number should not be empty' });
      }
      const user = await this.userService.update(parseInt(id), {
        name: body.name,
        email: body.email,
        phoneNumber: body.phoneNumber,
      });

      if (!user) {
        console.error('User not found');
      }
      return res.redirect('/users/' + id);
    } catch (error) {
      console.error(error);
    }
  }

  @Post()
  async createUser(
    @Body() body: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = {
      name: body.name,
      email: body.email,
      phoneNumber: body.phoneNumber,
      password: body.password,
    };

    const user = await this.userService.create(data);
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
    req.flash('toast', 'User Edited');
    res.redirect('/users');
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.userService.remove(parseInt(id));
    req.flash('toast', 'User Successfully Deleted');
    res.redirect('/users');
  }
}

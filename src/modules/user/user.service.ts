import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dto/request/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async updateUser2(id: number, input: Partial<UpdateUserDto>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    Object.assign(user, input);
    return await this.repo.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    await this.repo.delete(user);

    return { message: 'User Successfully Deleted!' };
  }

  async getAgeChartData() {
    const users = await this.repo.find();

    const data: Record<string, number> = {};

    users.forEach((user) => {
      if (!user.dob) {
        return;
      }
      const year = user.dob.getFullYear();

      const rangeStart = Math.floor(year / 5) * 5;
      const rangeEnd = rangeStart + 4;

      const rangeKey = `${rangeStart}-${rangeEnd}`;

      if (!(rangeKey in data)) {
        data[rangeKey] = 1;
      } else {
        data[rangeKey] += 1;
      }
    });

    return data;
  }

  async getGenderChartData() {
    const users = await this.repo.find();

    const data: Record<string, number> = {};

    users.forEach((user) => {
      if (!(user.gender in data)) {
        data[user.gender] = 1;
      } else {
        data[user.gender] += 1;
      }
    });

    return data;
  }

  async countAll() {
    return await this.repo.count();
  }

  async find(query: PaginateQuery): Promise<Paginated<User>> {
    const results = await paginate(query, this.repo, {
      sortableColumns: [
        'id',
        'name',
        'email',
        'phoneNumber',
        'createdAt',
        'updatedAt',
      ],
      searchableColumns: [
        'name',
        'email',
        'phoneNumber',
        'id',
        'createdAt',
        'updatedAt',
        'language',
      ],
      defaultSortBy: [['id', 'ASC']],
      defaultLimit: 10,
      maxLimit: 100,
      filterableColumns: {},
    });

    return results;
  }
  findOneByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not Found!!');
    }
    return user;
  }

  async create(attributes: Partial<User>) {
    const checkUser = await this.repo.findOne({
      where: { email: attributes.email },
    });
    if (checkUser) {
      throw new BadRequestException({
        email: ['email already exist'],
        message: 'email already exist',
      });
    }
    const user = this.repo.create(attributes);
    const userSaved = await this.repo.save(user);
    return userSaved;
  }

  async update(id: number, attributes: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('user not found');
    Object.assign(user, attributes);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('user not found');
    return this.repo.remove(user);
  }
}

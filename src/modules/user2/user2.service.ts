import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User2 } from './user2.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class User2Service {
  constructor(@InjectRepository(User2) private repo: Repository<User2>) {}

  async getUserPaginate(query: PaginateQuery): Promise<Paginated<User2>> {
    return paginate(query, this.repo, {
      searchableColumns: ['name', 'language'],
      defaultSortBy: [['id', 'ASC']],
      sortableColumns: ['dob', 'createdAt'],
      filterableColumns: {
        createdAt: true,
        name: true,
      },
    });
  }

  async updateUser2(id: string, input: Partial<UpdateUserDto>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    Object.assign(user, input);
    return await this.repo.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found!');

    await this.repo.delete(user);

    return { message: 'User Successfully Deleted!' };
  }

  async getAgeChartData() {
    const users = await this.repo.find();

    const data: Record<string, number> = {};

    users.forEach((user) => {
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
}

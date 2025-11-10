import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

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

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
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

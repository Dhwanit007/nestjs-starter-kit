import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { promisify } from 'util';

import { UpdateUserDto } from './dto/request/update-user.dto';
import { User } from './user.entity';

const scrypt = promisify(crypto.scrypt);
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

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
      ],
      defaultSortBy: [['id', 'ASC']],
      defaultLimit: 10,
      maxLimit: 100,
      filterableColumns: {},
    });

    return results;
  }

  async findOneByEmail(email: string) {
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
    //@ts-ignore
    const hashedPassword = await this.hashPassword(attributes.password);
    const user = this.repo.create({ ...attributes, password: hashedPassword });
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
    return this.repo.softRemove(user);
  }
}

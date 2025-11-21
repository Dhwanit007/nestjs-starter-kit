import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly repo: Repository<Todo>,
  ) {}

  async findAll(): Promise<Todo[]> {
    return await this.repo.find({ order: { id: 'DESC' } });
  }

  async add(task: string): Promise<Todo> {
    const newTodo = this.repo.create({
      task,
      completed: false,
    });
    return await this.repo.save(newTodo);
  }

  async toggle(id: number): Promise<Todo> {
    const todo = await this.repo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');
    todo.completed = !todo.completed;
    return await this.repo.save(todo);
  }

  async delete(id: number): Promise<void> {
    const todo = await this.repo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException('Todo not found');
    await this.repo.remove(todo);
  }
}

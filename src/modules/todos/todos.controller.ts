/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  // Render Todo Page
  @Get()
  async renderTodos(@Req() req: Request, @Res() res: Response) {
    const todos = await this.todosService.findAll();

    return res.render('todos', {
      title: 'Todo List',
      page_title: 'Manage Tasks',
      folder: 'Todos',
      todos,
      toast: req.flash('toast')[0] || null,
    });
  }

  // Add new task
  @Post('add')
  async add(
    @Body('task') task: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (task && task.trim() !== '') {
      await this.todosService.add(task);
      req.flash('toast', '✅ Task added successfully!');
    } else {
      req.flash('toast', '⚠️ Task cannot be empty!');
    }
    return res.redirect('/todos');
  }

  // Toggle task completion
  @Post('toggle/:id')
  async toggle(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.todosService.toggle(Number(id));
    req.flash('toast', '🔁 Task status updated!');
    return res.redirect('/todos');
  }

  // Delete a task
  @Post('delete/:id')
  async delete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.todosService.delete(Number(id));
    req.flash('toast', '🗑️ Task deleted successfully!');
    return res.redirect('/todos');
  }
}

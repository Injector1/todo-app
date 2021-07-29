import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { Todo } from './todo.model';
import { UserService } from '../user/user.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class TodoService {
  constructor(
    @InjectMetric('todos_created') public todosCreatedCounter: Counter<string>,
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async createTodo(
    title: string,
    isDone: boolean,
    userId: string,
  ): Promise<Todo> {
    this.todosCreatedCounter.inc(1);
    return await this.userService.addUserTodo(userId, {
      title,
      isDone,
    });
  }

  async getTodos(): Promise<Todo[]> {
    return await this.prismaService.todo.findMany();
  }

  async getUserTodos(userId): Promise<Todo[]> {
    return await this.prismaService.todo.findMany({ where: { userId } });
  }

  async changeTodo(
    id: string,
    title?: string,
    isDone?: boolean,
  ): Promise<Todo> {
    return await this.prismaService.todo.update({
      where: {
        id,
      },
      data: {
        title,
        isDone,
      },
    });
  }

  async deleteTodos() {
    return await (
      await this.prismaService.todo.deleteMany({})
    ).count;
  }
}

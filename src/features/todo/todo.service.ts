import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { Todo } from './todo.model';
import { UserService } from '../user/user.service';

@Injectable()
export class TodoService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
  ) {}

  async createTodo(
    title: string,
    isDone: boolean,
    userId: string,
  ): Promise<Todo> {
    return await this.userService.addUserTodo(userId, {
      title,
      isDone,
    });
  }

  async getTodos(): Promise<Todo[]> {
    return await this.prismaService.todo.findMany();
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

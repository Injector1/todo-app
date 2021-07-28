import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { Todo } from '../todo/todo.model';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../auth/password.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private passwordService: PasswordService,
  ) {}

  async findUserById(id: string) {
    return await this.prismaService.user.findFirst({
      where: { id },
      include: { todos: true },
    });
  }

  async findUserByUsername(username: string) {
    return await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
  }

  async createUser(user: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await this.passwordService.hashPassword(
      user.password,
    );
    return await this.prismaService.user.create({
      data: {
        username: user.username,
        password: hashedPassword,
      },
    });
  }

  async getUserTodos(id: string) {
    return await this.prismaService.user.findFirst({
      where: { id },
      include: { todos: true },
    });
  }

  async updateUser(id: string, user: Prisma.UserUpdateInput) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        username: user.username,
        password: user.password,
      },
    });
  }

  async addUserTodo(id: string, todo: { title: string; isDone: boolean }) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          todos: {
            create: { ...todo },
          },
        },
        select: {
          todos: true,
        },
      });
      return updatedUser.todos.reverse()[0];
    } catch (e) {
      console.log(e);
    }
  }
}

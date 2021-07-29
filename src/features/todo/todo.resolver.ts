import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { UserEntity } from '../user/user.decorator';
import { User } from '@prisma/client';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Todo])
  todos(@UserEntity() user: User) {
    return this.todoService.getUserTodos(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  createTodo(
    @UserEntity() user: User,
    @Args('title', { type: () => String }) title: string,
    @Args('isDone', { type: () => Boolean }) isDone: boolean,
  ) {
    return this.todoService.createTodo(title, isDone, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  updateTodo(
    @Args('id') id: string,
    @Args('title', { defaultValue: '' }) title: string,
    @Args('isDone', { defaultValue: false }) isDone: boolean,
  ) {
    return this.todoService.changeTodo(id, title, isDone);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  deleteTodos() {
    return this.todoService.deleteTodos();
  }
}

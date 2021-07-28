import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';

@Resolver(() => Todo)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Todo])
  todos() {
    return this.todoService.getTodos();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  createTodo(
    @Args('title', { type: () => String }) title: string,
    @Args('isDone', { type: () => Boolean }) isDone: boolean,
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return this.todoService.createTodo(title, isDone, userId);
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

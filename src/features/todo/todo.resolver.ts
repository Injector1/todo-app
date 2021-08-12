import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  InputType,
  Field,
} from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { UserEntity } from '../user/user.decorator';
import { User } from '@prisma/client';

@InputType()
class TodoInput extends Todo {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => String, { defaultValue: '' })
  title: string;

  @Field(() => Boolean, { defaultValue: false })
  isDone: boolean;
}

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
    @Args('todoInput') todoInput: TodoInput,
  ) {
    return this.todoService.createTodo(
      todoInput.title,
      todoInput.isDone,
      user.id,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  updateTodo(@Args('updateTodoInput') updateTodoInput: TodoInput) {
    return this.todoService.changeTodo(
      updateTodoInput.id,
      updateTodoInput.title,
      updateTodoInput.isDone,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  deleteTodos() {
    return this.todoService.deleteTodos();
  }
}

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
  ResolveField,
  Parent,
  PartialType,
} from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';
import { UserEntity } from '../user/user.decorator';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';

@InputType()
class TodoCreateInput extends Todo {
  @Field(() => String)
  title: string;

  @Field(() => Boolean, { defaultValue: false })
  isDone: boolean;
}

@InputType()
class TodoUpdateInput extends PartialType(TodoCreateInput) {
  @Field(() => String)
  id: string;

  @Field(() => Boolean, { nullable: true })
  isDone: boolean;
}

@Resolver(() => Todo)
export class TodoResolver {
  constructor(
    private readonly todoService: TodoService,
    private userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Todo])
  todos(@UserEntity() user: User) {
    return this.todoService.getUserTodos(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  createTodo(
    @UserEntity() user: User,
    @Args('todoInput') todoInput: TodoCreateInput,
  ) {
    return this.todoService.createTodo(
      todoInput.title,
      todoInput.isDone,
      user.id,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Todo)
  updateTodo(@Args('updateTodoInput') updateTodoInput: TodoUpdateInput) {
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

  @ResolveField()
  async creator(@Parent() todo: Todo) {
    return this.userService.findUser({ id: todo.userId });
  }
}

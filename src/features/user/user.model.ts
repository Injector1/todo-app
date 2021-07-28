import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User as PrismaUser } from '@prisma/client';
import { Todo } from '../todo/todo.model';

@ObjectType()
export class User implements PrismaUser {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => [Todo], { defaultValue: [] })
  todos?: Todo[];
}

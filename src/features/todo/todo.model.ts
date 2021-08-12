import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Todo as PrismaTodo } from '@prisma/client';
import { User } from '../user/user.model';

@ObjectType()
export class Todo implements PrismaTodo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  isDone: boolean;

  @Field(() => User)
  creator?: User;

  userId: string;
}

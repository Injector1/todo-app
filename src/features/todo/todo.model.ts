import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Todo as PrismaTodo } from '@prisma/client';

@ObjectType()
export class Todo implements PrismaTodo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Boolean)
  isDone: boolean;

  @Field(() => ID)
  userId: string;
}

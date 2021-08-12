import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  getUser(@Args('userId', { type: () => ID }) id: string) {
    return this.userService.getUserProfile({ id });
  }

  @Query(() => User)
  testQuery(@Args('userId') id: string) {
    return this.userService.getUserProfile({ id });
  }
}

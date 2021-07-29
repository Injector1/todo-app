import { Body, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  getUser(@Args('userId') userId: string) {
    return this.userService.findUserById(userId);
  }

  @Query(() => String)
  testQuery() {
    return 'abc';
  }
}

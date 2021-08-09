import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectMetric('users_signed_up') public signedUpCounter: Counter<string>,
    @InjectMetric('users_logged_in') public loggedInCounter: Counter<string>,
    private userService: UserService,
    private passwordService: PasswordService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findUser({ username });
    if (
      user &&
      this.passwordService.comparePasswords(password, user.password)
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signUp(user: Prisma.UserCreateInput) {
    this.signedUpCounter.inc(1);
    const createdUser = await this.userService.createUser(user);
    return createdUser;
  }
}

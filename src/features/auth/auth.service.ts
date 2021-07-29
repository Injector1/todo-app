import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { TokenService } from '../token/token.service';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectMetric('users_signed_up') public signedUpCounter: Counter<string>,
    @InjectMetric('users_logged_in') public loggedInCounter: Counter<string>,
    private userService: UserService,
    private tokenService: TokenService,
    private passwordService: PasswordService,
  ) {}

  async signUp(user: Prisma.UserCreateInput) {
    this.signedUpCounter.inc(1);
    const createdUser = await this.userService.createUser(user);
    return await this.createTokens(createdUser);
  }

  async signIn(user: Prisma.UserCreateInput, refreshToken?: string) {
    const existingUser = await this.userService.findUserByUsername(
      user.username,
    );

    if (!existingUser) {
      throw new BadRequestException('No user in Database');
    }
    this.loggedInCounter.inc(1);

    if (refreshToken && existingUser) {
      return await this.createTokens(existingUser, refreshToken);
    }
    const passwordMatch = await this.passwordService.comparePasswords(
      user.password,
      existingUser.password,
    );
    if (passwordMatch) {
      return await this.createTokens(existingUser);
    }
    throw new BadRequestException('Invalid credentials');
  }

  async createTokens(user: User, existingRefreshToken?: string) {
    const accessTokenExpiresIn = Number(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    );
    const refreshTokenExpiresIn = Number(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    );

    const tokenPayload = {
      id: user.id,
      username: user.username,
    };

    if (
      existingRefreshToken &&
      (await this.tokenService.refreshTokenExists(existingRefreshToken))
    ) {
      // IF there is existing refresh token. then creating only new access token
      const accessToken = await this.tokenService
        .generateToken(tokenPayload, {
          expiresIn: accessTokenExpiresIn,
        })
        .then(
          async (token) =>
            await this.tokenService.getCookieWithAccessToken(token),
        );
      return {
        accessToken,
        refreshToken: existingRefreshToken,
      };
    } else {
      // Otherwise creating two new tokens
      const accessToken = await this.tokenService
        .generateToken(tokenPayload, {
          expiresIn: accessTokenExpiresIn,
        })
        .then(
          async (token) =>
            await this.tokenService.getCookieWithAccessToken(token),
        );

      const refreshToken = await this.tokenService
        .generateToken(tokenPayload, {
          expiresIn: refreshTokenExpiresIn,
        })
        .then(
          async (token) =>
            await this.tokenService.getCookieWithRefreshToken(token),
        );

      return {
        accessToken,
        refreshToken,
      };
    }
  }
}

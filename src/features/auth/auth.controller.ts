import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenService } from '../token/token.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Post('/signUp')
  async signUp(@Req() request: Request, @Res() response: Response) {
    const user = request.body;

    const cookies = await this.authService.signUp(user);

    response.header('Set-Cookie', [cookies.accessToken, cookies.refreshToken]);

    return response.send(user);
  }

  @Post('/login')
  async login(@Req() request: Request, @Res() response: Response) {
    const user = request.body;
    console.log(user);

    const cookies = await this.authService.signIn(
      user,
      request.cookies?.Refresh,
    );
    response.header('Set-Cookie', [cookies.accessToken, cookies.refreshToken]);
    delete user?.password;
    return response.status(200).send(user);
  }

  @Post('/refresh')
  async refresh(@Req() request: Request, @Res() response: Response) {
    const refreshToken = request.cookies?.Refresh;

    const data = await this.tokenService.verifyRefreshToken(refreshToken);

    const cookies = await this.authService.createTokens(data, refreshToken);

    response.header('Set-Cookie', [cookies.accessToken, cookies.refreshToken]);

    return response.send(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@Req() request: Request) {
    console.log(request.cookies);
  }

  @Get('/cookies')
  getCookies(@Req() request: Request) {
    console.log(request.cookies);
  }
}

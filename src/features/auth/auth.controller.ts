import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request as NestRequest,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { LoginGuard } from './guards/login.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LoginGuard)
  @Post('/signin')
  async signIn(@Res() res: Response) {
    res.send('home');
  }

  @Post('/signup')
  async signUp(@Req() request: Request) {
    const createdUser = await this.authService.signUp(request.body);

    if (createdUser) {
      delete createdUser.password;
      return createdUser;
    }
  }
  @UseGuards(AuthenticatedGuard)
  @Get('/home')
  getHome(@NestRequest() req) {
    if (!req.session.time) req.session.time = 123;
    console.log(req);

    return { user: req.user };
  }
}

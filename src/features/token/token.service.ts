import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { addSeconds } from 'date-fns';
import { AccessToken, RefreshToken } from '@prisma/client';
import { exists } from 'fs';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async saveToken(
    data: { accessToken?: string; refreshToken?: string },
    expiresAt,
  ): Promise<AccessToken | RefreshToken> {
    if (data.accessToken) {
      return await this.prismaService.accessToken.create({
        data: {
          token: data.accessToken,
          expiresAt,
        },
      });
    }
    return await this.prismaService.refreshToken.create({
      data: {
        token: data.refreshToken,
        expiresAt,
      },
    });
  }

  async generateToken(data, options?: JwtSignOptions): Promise<string> {
    return await this.jwtService.sign(data, options);
  }

  async getCookieWithAccessToken(token: string): Promise<string> {
    const expiresIn = Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN);

    const expiresAt = addSeconds(Date.now(), expiresIn);

    const savedToken = await this.saveToken({ accessToken: token }, expiresAt);

    return `Authentication=${savedToken.token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }

  async getCookieWithRefreshToken(token: string): Promise<string> {
    const expiresIn = Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN);

    const expiresAt = addSeconds(Date.now(), expiresIn);
    const savedToken = await this.saveToken({ refreshToken: token }, expiresAt);

    return `Refresh=${savedToken.token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }

  async findAccessToken(token: string) {
    return await this.prismaService.accessToken.findFirst({
      where: {
        token,
      },
    });
  }

  async findRefreshToken(token: string) {
    return await this.prismaService.accessToken.findFirst({
      where: {
        token,
      },
    });
  }

  async checkTokenAge(data: {
    accessToken?: AccessToken;
    refreshToken?: RefreshToken;
  }) {
    const token = data.accessToken || data.refreshToken;

    if (token && Number(token.expiresAt) >= Date.now()) {
      return true;
    } else if (token && Number(token.expiresAt) < Date.now()) {
      await this.deleteToken({
        accessToken: data.accessToken?.token,
        refreshToken: data.refreshToken?.token,
      });
    }
    return false;
  }

  async accessTokenExists(token: string): Promise<boolean> {
    const existingToken = await this.findAccessToken(token);
    return await this.checkTokenAge({ accessToken: existingToken });
  }

  async refreshTokenExists(token: string): Promise<boolean> {
    const existingToken = await this.findRefreshToken(token);
    return await this.checkTokenAge({ refreshToken: existingToken });
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token);
      const tokenExists = await this.accessTokenExists(token);

      if (tokenExists) {
        return data;
      }
      throw new UnauthorizedException();
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token);

      const tokenExists = await this.refreshTokenExists(token);
      if (tokenExists) {
        return data;
      }
      throw new UnauthorizedException(
        "Refresh token expired or doesn't exists",
      );
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e.message);
    }
  }

  async deleteToken(data: { accessToken?: string; refreshToken?: string }) {
    const { accessToken, refreshToken } = data;
    if (accessToken) {
      return await this.prismaService.accessToken.delete({
        where: {
          token: accessToken,
        },
      });
    }
    return await this.prismaService.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
  }
}

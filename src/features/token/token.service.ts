import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { addSeconds } from 'date-fns';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async generateToken(data, options?: JwtSignOptions): Promise<string> {
    return await this.jwtService.sign(data, options);
  }

  async getCookieWithAccessToken(token: string): Promise<string> {
    const expiresIn = Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN);

    const expiresAt = addSeconds(Date.now(), expiresIn);

    const savedToken = await this.prismaService.accessToken.create({
      data: { token, expiresAt },
    });

    return `Authentication=${savedToken.token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }

  async getCookieWithRefreshToken(token: string): Promise<string> {
    const expiresIn = Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN);
    console.log(expiresIn);

    const expiresAt = addSeconds(Date.now(), expiresIn);
    const savedToken = await this.prismaService.refreshToken.create({
      data: { token, expiresAt },
    });

    return `Refresh=${savedToken.token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }

  async accessTokenExists(token: string): Promise<boolean> {
    const existingToken = await this.prismaService.accessToken.findFirst({
      where: {
        token,
      },
    });

    if (existingToken && Number(existingToken.expiresAt) >= Date.now()) {
      return true;
    } else if (existingToken && Number(existingToken.expiresAt) < Date.now()) {
      await this.deleteAccessToken(existingToken.token);
    }
    return false;
  }

  async refreshTokenExists(token: string): Promise<boolean> {
    const existingToken = await this.prismaService.refreshToken.findFirst({
      where: {
        token,
      },
    });
    if (existingToken && Number(existingToken.expiresAt) >= Date.now()) {
      return true;
    } else if (existingToken && Number(existingToken.expiresAt) < Date.now()) {
      await this.deleteRefreshToken(existingToken.token);
    }
    return false;
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

  async deleteAccessToken(token: string) {
    return await this.prismaService.accessToken
      .delete({
        where: {
          token,
        },
      })
      .catch((e) => console.log(e));
  }

  async deleteRefreshToken(token: string) {
    return await this.prismaService.refreshToken
      .delete({
        where: {
          token,
        },
      })
      .catch((e) => console.log(e));
  }

  functionToTest() {
    return 'abc';
  }
}

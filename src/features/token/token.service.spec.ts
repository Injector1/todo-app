import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { addSeconds } from 'date-fns';
import { JsxText } from 'ts-morph';
import { PrismaModule } from '../../orm/prisma/prisma.module';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule.register({ secret: 'secret' })],
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    tokenService = moduleRef.get<TokenService>(TokenService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('shoud be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('generateToken', () => {
    it('should return JWT', async () => {
      jest.spyOn(tokenService, 'generateToken').mockResolvedValue('token');
      const payload = { username: 'abc', password: 'abc' };
      expect(await tokenService.generateToken(payload)).toBe('token');
    });
  });

  describe('accessTokenExists', () => {
    it('should return true if access token hasnt expired', async () => {
      const dateExpired = addSeconds(Date.now(), 10);
      const tokenDto = {
        id: 'abc',
        token: 'accessToken',
        expiresAt: dateExpired,
        createdAt: new Date(),
      };
      jest.spyOn(tokenService, 'findAccessToken').mockResolvedValue(tokenDto);

      expect(await tokenService.accessTokenExists('accessToken')).toBe(true);
    });

    it('should return false if access token has expired', async () => {
      const dateExpired = addSeconds(Date.now(), -10);
      const tokenDto = {
        id: 'abc',
        token: 'accessToken',
        expiresAt: dateExpired,
        createdAt: new Date(),
      };
      jest.spyOn(tokenService, 'findAccessToken').mockResolvedValue(tokenDto);
      jest.spyOn(tokenService, 'deleteToken').mockResolvedValue(tokenDto);
      expect(await tokenService.accessTokenExists('accessToken')).toBe(false);
    });
  });

  describe('refreshTokenExists', () => {
    it('should return true if refresh token hasnt expired', async () => {
      const dateExpired = addSeconds(Date.now(), 10);
      const tokenDto = {
        id: 'abc',
        token: 'refreshToken',
        expiresAt: dateExpired,
        createdAt: new Date(),
      };
      jest.spyOn(tokenService, 'findRefreshToken').mockResolvedValue(tokenDto);

      expect(await tokenService.refreshTokenExists('accessToken')).toBe(true);
    });

    it('should return false if refresh token has expired', async () => {
      const dateExpired = addSeconds(Date.now(), -10);
      const tokenDto = {
        id: 'abc',
        token: 'refreshToken',
        expiresAt: dateExpired,
        createdAt: new Date(),
      };
      jest.spyOn(tokenService, 'findRefreshToken').mockResolvedValue(tokenDto);
      jest.spyOn(tokenService, 'deleteToken').mockResolvedValue(tokenDto);
      expect(await tokenService.refreshTokenExists('refreshToken')).toBe(false);
    });
  });
});

import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaModule } from '../../orm/prisma/prisma.module';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      providers: [TokenService],
    }).compile();

    tokenService = moduleRef.get<TokenService>(TokenService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it('shoud be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('functionToTest', () => {
    it('should return string', async () => {
      const result = 'abc';
      jest
        .spyOn(tokenService, 'functionToTest')
        .mockImplementation(() => result);
      expect(await tokenService.functionToTest()).toBe(result);
    });
  });
});

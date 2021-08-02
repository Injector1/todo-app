import { BadRequestException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { TokenService } from '../token/token.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let authService: AuthService;
  let tokenService: TokenService;
  let userService: UserService;
  let passwordService: PasswordService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule,
        UserModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      providers: [
        PasswordService,
        AuthService,
        {
          provide: TokenService,
          useValue: {
            saveToken: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
        {
          provide: 'PROM_METRIC_USERS_SIGNED_UP',
          useValue: {
            inc: jest.fn(),
          },
        },
        {
          provide: 'PROM_METRIC_USERS_LOGGED_IN',
          useValue: {
            inc: jest.fn(),
          },
        },
      ],
    }).compile();
    jest.resetModules();

    process.env = { ...OLD_ENV };

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    tokenService = moduleRef.get<TokenService>(TokenService);
    passwordService = moduleRef.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '123';
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '123';
    it('should return tokens when register is successful', async () => {
      jest.spyOn(userService, 'findUser').mockResolvedValue(undefined);
      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue({ foo: 'bar' } as never);

      jest.spyOn(tokenService, 'saveToken').mockResolvedValue({
        id: '123',
        token: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });
      jest.spyOn(tokenService, 'generateToken').mockResolvedValue('token');

      const registerDto = { username: 'abc', password: 'abc' };

      const authData = await authService.signUp(registerDto);
      expect(authData).toHaveProperty('accessToken');
      expect(authData).toHaveProperty('refreshToken');
      expect(authData.accessToken).toBe(
        'Authentication=token; HttpOnly; Path=/; Max-Age=123',
      );
      expect(authData.refreshToken).toBe(
        'Refresh=token; HttpOnly; Path=/; Max-Age=123',
      );
    });

    it('should return error when user name is exist', async () => {
      jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue({ id: '123', username: 'abc', password: 'abc' });

      const registerDto = { username: 'abc', password: 'abc' };

      await expect(authService.signUp(registerDto)).rejects.toThrow(
        new BadRequestException('User with this credentials already exists'),
      );
    });
  });

  describe('login', () => {
    it('should return user profile when login is successful, also new tokens', async () => {
      jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue({ id: '123', username: 'abc', password: 'abc' });
      jest.spyOn(tokenService, 'saveToken').mockResolvedValue({
        id: '123',
        token: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });
      jest.spyOn(tokenService, 'generateToken').mockResolvedValue('token');
      jest
        .spyOn(passwordService, 'comparePasswords')
        .mockImplementation(async (pass1, pass2) => pass1 === pass2);

      const loginDto = { username: 'abc', password: 'abc' };
      const loginData = await authService.signIn(loginDto);

      expect(loginData.accessToken).toBe(
        'Authentication=token; HttpOnly; Path=/; Max-Age=123',
      );
      expect(loginData.refreshToken).toBe(
        'Refresh=token; HttpOnly; Path=/; Max-Age=123',
      );
    });

    it('should throw error when credentials are false', async () => {
      const loginDto = { username: 'abc', password: 'a' };

      expect(authService.signIn(loginDto)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });
  });
});

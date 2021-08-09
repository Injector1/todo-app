import { BadRequestException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let passwordService: PasswordService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule,
        UserModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      providers: [
        PasswordService,
        AuthService,
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
            verify: jest.fn(),
            decode: jest.fn(),
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
    passwordService = moduleRef.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should return user when register is successful', async () => {
      jest.spyOn(userService, 'findUser').mockResolvedValue(undefined);
      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue({ username: 'abc' } as never);

      const registerDto = { username: 'abc', password: 'abc' };

      const authData = await authService.signUp(registerDto);
      expect(authData).not.toHaveProperty('password');
      expect(authData).toHaveProperty('username');
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
});

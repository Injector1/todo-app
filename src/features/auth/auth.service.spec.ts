import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule,
        TokenModule,
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      providers: [AuthService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });
});

import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    TokenModule,
    forwardRef(() => UserModule),
    TokenModule,
  ],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    makeCounterProvider({
      name: 'users_signed_up',
      help: 'how_many_users_signed_up',
    }),
    makeCounterProvider({
      name: 'users_logged_in',
      help: 'how_many_users_logged_in',
    }),
  ],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}

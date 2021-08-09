import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { PasswordService } from './password.service';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MailModule } from '../mail/mail.module';
import { SessionSerializer } from './session.serializer';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: true }),
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    PasswordService,
    SessionSerializer,
    LocalStrategy,
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

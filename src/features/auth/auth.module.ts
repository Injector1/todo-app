import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    TokenModule,
    forwardRef(() => UserModule),
    TokenModule,
  ],
  providers: [AuthService, PasswordService, JwtStrategy],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}

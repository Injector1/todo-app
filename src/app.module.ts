import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from './orm/prisma/prisma.module';
import { UserModule } from './features/user/user.module';
import { TodoModule } from './features/todo/todo.module';
import { AuthModule } from './features/auth/auth.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    PrismaModule,
    TodoModule,
    AuthModule,
    UserModule,
    PrometheusModule.register(),
  ],
  providers: [],
})
export class AppModule {}

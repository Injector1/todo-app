import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from './orm/prisma/prisma.module';
import { UserModule } from './features/user/user.module';
import { TodoModule } from './features/todo/todo.module';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    PrismaModule,
    TodoModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}

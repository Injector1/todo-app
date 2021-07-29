import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { UserModule } from '../user/user.module';
import {
  makeCounterProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [
    TodoService,
    TodoResolver,
    PrismaService,
    makeCounterProvider({
      name: 'todos_created',
      help: 'how_many_todos_have_been_created',
    }),
  ],
})
export class TodoModule {}

import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoResolver } from './todo.resolver';
import { PrismaModule } from 'src/orm/prisma/prisma.module';
import { PrismaService } from 'src/orm/prisma/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [TodoService, TodoResolver, PrismaService],
})
export class TodoModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import * as pg from 'pg';
import * as pgSessionModule from 'connect-pg-simple';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*', credentials: true },
  });
  const pgPool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DATABASE,
  });
  const pgSession = pgSessionModule(session);

  app.use(cookieParser());
  app.use(
    session({
      store: new pgSession({
        pool: pgPool,
        tableName: 'Session',
      }),
      secret: process.env.SESSION_COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Number(process.env.SESSION_COOKIE_EXPIRES_IN),
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(8001);
}
bootstrap();

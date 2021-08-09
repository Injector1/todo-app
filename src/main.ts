import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*', credentials: true },
  });
  app.use(cookieParser());
  app.use(
    session({
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

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async hashPassword(rawPassword) {
    const saltOrRounds = Number(process.env.SALT_OR_ROUNDS);
    return await bcrypt.hash(rawPassword, saltOrRounds);
  }

  async comparePasswords(incomingPassword, savedPassword): Promise<boolean> {
    return await bcrypt.compare(incomingPassword, savedPassword);
  }
}

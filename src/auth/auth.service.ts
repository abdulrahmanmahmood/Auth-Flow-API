import { Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';

@Injectable()
export class AuthService {
  register(registerDto: RegisterDTO) {
    return registerDto;
  }
}

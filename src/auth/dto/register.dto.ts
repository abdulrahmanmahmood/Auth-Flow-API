import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User Registration')
export class RegisterDTO extends CreateUserDto {}

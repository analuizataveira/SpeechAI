import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

export interface IUsersService {
  createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
}

import { PrismaService } from '../../providers/database/prisma.provider';
import { IUsersService } from './interfaces/users.service.interface';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
export declare class UsersService implements IUsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(createUserDto: CreateUserDto): Promise<UserResponseDto>;
}

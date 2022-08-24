import { injectable } from 'inversify';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUserService } from './users.service.interface';

@injectable()
export class UserService implements IUserService {
	async createUser({ email, name, password }: UserRegisterDto): Promise<User | null> {
		const newUser = new User(email, name);
		await newUser.setPassword(password);

		// Проверка, есть ли пользователь в БД
		// Если в БД уже есть такой пользователь, возвращаем null
		// Если в БД нет такого пользователя, создаем
		return null;
	}

	async validateUser(dto: UserLoginDto): Promise<boolean> {
		return true;
	}
}

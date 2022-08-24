import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.service.inteface';
import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUserService } from './users.service.interface';

@injectable()
export class UserService implements IUserService {
	constructor(@inject(TYPES.ConfigService) private configService: IConfigService) {}

	async createUser({ email, name, password }: UserRegisterDto): Promise<User | null> {
		const newUser = new User(email, name);

		const salt = this.configService.get('SALT');

		console.log(salt);

		await newUser.setPassword(password, Number(salt));

		// Проверка, есть ли пользователь в БД
		// Если в БД уже есть такой пользователь, возвращаем null
		// Если в БД нет такого пользователя, создаем
		return null;
	}

	async validateUser(dto: UserLoginDto): Promise<boolean> {
		return true;
	}
}

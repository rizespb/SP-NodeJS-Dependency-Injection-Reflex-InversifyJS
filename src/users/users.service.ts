import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { IConfigService } from '../config/config.service.inteface';
import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUsersRepository } from './users.repository.interface';
import { IUserService } from './users.service.interface';

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
	) {}

	async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
		const newUser = new User(email, name);

		// Получаем SALT из .env
		const salt = this.configService.get('SALT');

		await newUser.setPassword(password, Number(salt));

		// Проверяем, есть ли такой пользователь в БД
		const existedUser = await this.usersRepository.find(email);

		if (existedUser) {
			return null;
		}

		// Проверка, есть ли пользователь в БД
		// Если в БД уже есть такой пользователь, возвращаем null
		// Если в БД нет такого пользователя, создаем
		return this.usersRepository.create(newUser);
	}

	async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
		// Находим пользователя в БД
		const existedUser = await this.usersRepository.find(email);

		if (!existedUser) {
			return false;
		}

		// На основе найденного пользователя создаем сущность нового пользователя ( созданного пользователя в passwordHash помещаем password от existedUser - хэш пароля, хранимый в БД)
		// Это мы делаем, чтобы получить доступ к comparePassword и сравнить присланный пароль с хэшем в БД
		const newUser = new User(existedUser.email, existedUser.name, existedUser.password);

		return newUser.comparePassword(password);
	}

	async getUserInfo(email: string): Promise<UserModel | null> {
		return this.usersRepository.find(email);
	}
}

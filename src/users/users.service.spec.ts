import 'reflect-metadata';
import { IUsersRepository } from './users.repository.interface';
import { Container } from 'inversify';
import { IConfigService } from '../config/config.service.inteface';
import { IUserService } from './users.service.interface';
import { TYPES } from '../types';
import { UserService } from './users.service';
import { User } from './user.entity';
import { UserModel } from '@prisma/client';

// Делаем моки, чтобы подменить зависимости UserService
// Мы делаем моки функций для того, чтобы они соответствовали переданным интерфейсам при container.bind
// Потом мы перезапишем эти свойства с нужной нам имплементацией
const ConfigServiceMock: IConfigService = {
	get: jest.fn(),
};

const UsersRepositoryMock: IUsersRepository = {
	create: jest.fn(),
	find: jest.fn(),
};

const container = new Container();

let configService: IConfigService;
let usersRepository: IUsersRepository;
let usersService: IUserService;

let createdUser: UserModel | null;

beforeAll(() => {
	container.bind<IUserService>(TYPES.UserService).to(UserService);

	// Заменяем некоторые зависимости на моки с использованием метода toConstantValue
	container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock);
	container.bind<IUsersRepository>(TYPES.UsersRepository).toConstantValue(UsersRepositoryMock);

	// Сохраняем зависимости в переменные
	configService = container.get<IConfigService>(TYPES.ConfigService);
	usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository);
	usersService = container.get<IUserService>(TYPES.UserService);
});

describe('User Service', () => {
	it('createUser', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1');

		usersRepository.create = jest.fn().mockImplementationOnce((user: User): UserModel => {
			return {
				name: user.name,
				email: user.email,
				password: user.password,
				id: 1,
			};
		});

		createdUser = await usersService.createUser({
			email: 'a@a.com',
			name: 'Антон',
			password: '1',
		});

		expect(createdUser?.id).toEqual(1);
		expect(createdUser?.password).not.toEqual(1);
	});

	it('validateUser - success', async () => {
		// В createdUser хранится пользователь, созданный в предыдущем тесте.
		// Это немного некорректно, но решили для этого кейса сделать так
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);

		const result = await usersService.validateUser({
			email: 'a@a.com',
			password: '1',
		});

		expect(result).toBeTruthy;
	});

	it('validateUser - wrong password', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);

		const result = await usersService.validateUser({
			email: 'a@a.com',
			password: 'wrongPassword',
		});

		expect(result).toBeFalsy;
	});

	it('validateUser - wrong password', async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(null);

		const result = await usersService.validateUser({
			email: 'a@a.com',
			password: '1',
		});

		expect(result).toBeFalsy;
	});
});

import { ILogger } from './logger/logger.interface';
import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ExceptionFilter } from './errors/exeption.filter';
import { LoggerService } from './logger/logger.service';
import { UserController } from './users/users.controller';
import { TYPES } from './types';
import { IExceptionFilter } from './errors/exeption.filter.interface';
import { IUserController } from './users/users.controller.interface';
import { IUserService } from './users/users.service.interface';
import { UserService } from './users/users.service';
import { IConfigService } from './config/config.service.inteface';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { UsersRepository } from './users/users.repository';
import { IUsersRepository } from './users/users.repository.interface';

// async function bootstrap() {
// const logger = new LoggerService()

// const app = new App(
//   logger,
//   new UserController(logger),
//   new ExeptionFilter(logger)
// )

// await app.init()
// }

// bootstrap()

export interface BootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	// В контейнер мы добавляем информацию, что интерфейсу ILogger будет соответствовать класс LoggerService
	// И если где-то мы будем делать inject по токену TYPES.ILogger (тут хранится Symbol), то мы должны взять экземпляр класса LoggerService и положить туда. И этот экземпляр класса будет иметь интерфес ILogger
	bind<ILogger>(TYPES.ILogger).to(LoggerService);

	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<IUserService>(TYPES.UserService).to(UserService);

	// inSingletonScope - будер реализован паттерн Singleton - создана только один объект - сущеность класса на все приложениеа
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<App>(TYPES.Application).to(App);
});

async function bootstrap(): Promise<BootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);

	// Получаем экземпляр класса app
	const app = appContainer.get<App>(TYPES.Application);

	await app.init();

	return { appContainer, app };
}

// Экспорты заранее указали для дальнейшего использования их в тестах
export const boot = bootstrap();

import express, { Express } from 'express';
import { Server } from 'http';
import { UserController } from './users/users.controller';
import { ExceptionFilter } from './errors/exeption.filter';
import { ILogger } from './logger/logger.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import 'reflect-metadata';
import { json } from 'body-parser';

// @injectable() - декоратор, который говорит о том, что данный класс МОЖНО положить в контейнер
@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;

	// constructor(logger: ILogger, userController: UserController, expetionFilter: ExceptionFilter) {
	//   this.app = express()
	//   this.port = 8000
	//   this.logger = logger
	//   this.userController = userController
	//   this.expetionFilter = expetionFilter
	// }
	constructor(
		// Инжектим ILogger из контейнера
		// В контейнера ILogger связан с классом LoggerService через константу TYPES.ILogger
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.UserController) private userController: UserController,
		@inject(TYPES.ExceptionFilter) private expetionFilter: ExceptionFilter,
	) {
		this.app = express();
		this.port = 8000;
	}

	// Слой для парсинга всех входящих запросов и сериализации json
	useMiddleware(): void {
		this.app.use(json());
	}

	useRoutes(): void {
		this.app.use('/users', this.userController.router);
	}

	// Обработка ошибок
	useExeptionFilters(): void {
		this.app.use(this.expetionFilter.catch.bind(this.expetionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();

		// Обработку ошибок ставим после всех MiddleWare - оно отработает, если ни один из предудыщих слоев не смог обработать запрос
		this.useExeptionFilters();

		this.server = this.app.listen(this.port);

		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}
}

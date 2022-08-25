import { ValidateMiddleware } from './../common/validate.middleware';
import { UserLoginDto } from './dto/user-login.dto';
import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http-error';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from './users.service';

// @injectable() - декоратор, который говорит о том, что данный класс МОЖНО положить в контейнер
@injectable()
export class UserController extends BaseController implements IUserController {
	// constructor(logger: LoggerService) {
	//   super(logger)
	//   this.bindRoutes([{ path: '/register', method: 'post', func: this.register }])
	//   this.bindRoutes([{ path: '/login', method: 'post', func: this.login }])
	// }

	// Инжектим ILogger из контейнера
	// В контейнера ILogger связан с классом LoggerService через константу TYPES.ILogger
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private userService: UserService,
	) {
		super(loggerService);

		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
		]);
	}

	// Третий интерфейс в дженерике Request - это Request Body
	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		// this.ok(res, 'login')
		const result = await this.userService.validateUser(req.body);

		if (!result) {
			// Имитация ошибки
			return next(new HTTPError(401, 'Ошибка авторизации', 'login'));
		}

		this.ok(res, {});
	}

	// Третий интерфейс в дженерике Request - это Request Body
	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body);

		if (!result) {
			return next(new HTTPError(422, 'Такой пользователь уже существует'));
		}

		this.ok(res, { email: result.email, id: result.id });
	}
}

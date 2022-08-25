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
import { sign } from 'jsonwebtoken';
import { IConfigService } from '../config/config.service.inteface';
import { IUserService } from './users.service.interface';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { AuthGuard } from '../common/auth.guard';

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
		@inject(TYPES.UserService) private userService: IUserService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
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
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
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

		// Формируем JWT-токен
		// this.configService.get - получает занченние переменной SECRET из ENV-файла
		const secret = this.configService.get('SECRET');
		const jwt = await this.signJWT(req.body.email, secret);

		// Добавляем JWT в ответ
		this.ok(res, { jwt });
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

	// Метод для проверки валидности JWT
	// На данный момент в объект req уже добавлено поле user, в котором хранится email, полученный в AuthMiddleware из пришедшего с запросом JWT-токена
	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		this.ok(res, { email: user });
	}

	// Формирование подписи JWT
	// Сами решаем, что шифровать: email
	// Также необходимо добавить секрет
	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			// Первый аргумент - Payload. Кодируем email и iat - issued at - когда выпущена. Без iat у нас всегда был бы один и тот же токен
			// Второй аргумент - секрет для кодирования
			// Третий - необязательные опции. В данном случае указываем алгоритм шифрования. HS256 - один из самых популярнх
			// Четверnsq - коллбэк, который вызовется, когда будет завшифрован токен или прокинута ошибка
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}

					resolve(token as string);
				},
			);
		});
	}
}

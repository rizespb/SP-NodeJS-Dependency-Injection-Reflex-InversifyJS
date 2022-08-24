import { ILogger } from './../logger/logger.interface';
import { IExceptionFilter } from './exeption.filter.interface';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { HTTPError } from './http-error';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import 'reflect-metadata';

// @injectable() - декоратор, который говорит о том, что данный класс МОЖНО положить в контейнер
@injectable()
export class ExceptionFilter implements IExceptionFilter {
	// logger: LoggerService

	// logger передается явно. Но нам надо переделаь на работу с logger из контейнера
	// constructor(logger: LoggerService) {
	//   this.logger = logger
	// }

	// Инжектим ILogger из контейнера
	// В контейнера ILogger связан с классом LoggerService через константу TYPES.ILogger
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {}

	catch(err: Error | HTTPError, req: Request, res: Response, next: NextFunction): void {
		if (err instanceof HTTPError) {
			this.logger.error(`[${err.context}] Ошибка ${err.statusCode}: ${err.message}`);

			res.status(err.statusCode).send(`err: ${err.message}`);
		} else {
			this.logger.error(`${err.message}`);

			res.status(500).send(`err: ${err.message}`);
		}
	}
}

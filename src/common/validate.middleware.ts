// Этот мидлваре будет валидировать корректность приходящих в body данных: переданные ли необходимые поля и т.д.

import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { IMiddleWare } from './middleware.interface';

export class ValidateMiddleware implements IMiddleWare {
	constructor(private classToValidate: ClassConstructor<object>) {}

	execute({ body }: Request, res: Response, next: NextFunction): void {
		// преобразовываем body в класс classToValidate
		const instance = plainToInstance(this.classToValidate, body);

		// Проверяем, удалось ли преобразовать body в classToValidate без ошибок
		validate(instance).then((errors) => {
			if (errors.length > 0) {
				res.status(422).send(errors);
			} else {
				next();
			}
		});
	}
}

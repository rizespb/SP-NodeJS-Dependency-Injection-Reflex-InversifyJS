// Middleware, который проверяет, что пользователь авторизован и JWT-валидный (в AuthMiddleware в res добавляется поле user со значением - емейл пользователя)

import { Request, Response, NextFunction } from 'express';
import { IMiddleWare } from './middleware.interface';

export class AuthGuard implements IMiddleWare {
	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.user) {
			return next();
		}

		res.status(401).send({ error: 'Вы не авторизованы' });
	}
}

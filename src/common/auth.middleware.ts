import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { IMiddleWare } from './middleware.interface';

// Этот Middleware будет проверять запрос на наличие валидного JWT.
// Если JWT валидный, из него будет извлечен email пользователя и этим email будет обогащен объект req (объект запроса), который будет прокинут дальше в следующие Middleware
export class AuthMiddleware implements IMiddleWare {
	constructor(private secret: string) {}

	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			// authorization будет выглядеть: Bearer JWT
			// Убираем "Bearer "
			const jwt = req.headers.authorization.split(' ')[1];

			verify(jwt, this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload) {
					// Если все ок, то добавим в объект req данные о пользователе (email пользователя)
					// То есть "обогащаем" объект запроса
					// Но чтобы имеь возможность сделать это в TS, надо дописать типы в src\types\custom.d.ts
					req.user = (payload as JwtPayload).email;
					next();
				}
			});
		} else {
			next();
		}
	}
}

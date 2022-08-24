import { NextFunction, Request, Response, Router } from 'express';
import { IMiddleWare } from './middleware.interface';

export interface IControllerRoute {
	path: string;
	func: (req: Request, res: Response, next: NextFunction) => void;
	// method: 'get' | 'post' | 'delete' | 'patch' | 'put'
	method: keyof Pick<Router, 'get' | 'post' | 'delete' | 'patch' | 'put'>;
	// Массив middleware, которые должны применяться в роутере до того, как будет отправлен ответ
	middlewares?: IMiddleWare[];
}

// Этот интерфейс лектор получил через подсказу TS: навел курсор на методы класса BaseController send, ok или created
export type ExpressReturnType = Response<any, Record<string, any>>;

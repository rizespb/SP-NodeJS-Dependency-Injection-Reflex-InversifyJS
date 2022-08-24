import { Response, Router } from 'express';
import { injectable } from 'inversify';
import { ILogger } from '../logger/logger.interface';
import { ExpressReturnType, IControllerRoute } from './routeInterface';
export { Router } from 'express';
import 'reflect-metadata';

// @injectable() - декоратор, который говорит о том, что данный класс МОЖНО положить в контейнер
// В inversify если класс injectable и он наследует от другого класса, то родитель тоже должен быть @injectable()
// Т.к. от BaseController наследуются остальные контроллеры, то делаем его injectable
@injectable()
export abstract class BaseController {
	private readonly _router: Router;

	constructor(private logger: ILogger) {
		this._router = Router();
	}

	get router(): Router {
		return this._router;
	}

	public send<T>(res: Response, code: number, message: T): ExpressReturnType {
		res.type('application/json');

		return res.status(code).json(message);
	}

	public ok<T>(res: Response, message: T): ExpressReturnType {
		return this.send<T>(res, 200, message);
	}

	public created(res: Response): ExpressReturnType {
		return res.sendStatus(201);
	}

	// Мы при инициализации приложения будем проходить по массив routes и для каждого роута выполнять инструкцию, например, router.get('/some_path', (req, res, next)=>{})
	protected bindRoutes(routes: IControllerRoute[]): void {
		for (const route of routes) {
			this.logger.log(`${[route.method]} ${route.path}`);

			// Чтобы не потерять контекст, забиндим метод execute из каждого middleware на самого себя
			const middleware = route.middlewares?.map((m) => m.execute.bind(m));

			// Чтобы внутри переданной функции-хендлере this указывало на текущий объект, надо переопределиь контекст
			const handler = route.func.bind(this);

			const pipeline = middleware ? [...middleware, handler] : handler;

			this.router[route.method](route.path, pipeline);
		}
	}
}

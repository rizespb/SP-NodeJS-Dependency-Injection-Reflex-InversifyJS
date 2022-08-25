// TSC - TypeScript Compiler - подтянет файл *.d.ts. Для этого в nodemon.json в exec надо указать флаг --files
// Расширяем интерфейс Request из Express

declare namespace Express {
	export interface Request {
		user: string;
	}
}

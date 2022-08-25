import { UserModel } from '@prisma/client';
import { User } from './user.entity';

export interface IUsersRepository {
	// На вход получаем User - это entity, описывающая реальный бизнес-объект
	// UserModel - это тип, полученный из модели в schema.prisma путем npx prisma generate
	create: (user: User) => Promise<UserModel>;
	find: (email: string) => Promise<UserModel | null>;
}

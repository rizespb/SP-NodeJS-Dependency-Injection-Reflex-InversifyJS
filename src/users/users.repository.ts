// Репозиторий - это логика по работе с сущностями, хранимыми в БД

import { UserModel } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { PrismaService } from '../database/prisma.service';
import { TYPES } from '../types';
import { User } from './user.entity';
import { IUsersRepository } from './users.repository.interface';

@injectable()
export class UsersRepository implements IUsersRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	// На вход получаем User - это entity, описывающая реальный бизнес-объект
	// UserModel - это тип, полученный из модели в schema.prisma путем npx prisma generate
	async create({ email, password, name }: User): Promise<UserModel> {
		return this.prismaService.client.userModel.create({
			data: {
				email,
				password,
				name,
			},
		});
	}

	// Поиск юзера в БД по email
	// Если найдет, то вернет объект с типом UserModel, если нет, то null
	find(email: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findFirst({
			where: {
				email,
			},
		});
	}
}

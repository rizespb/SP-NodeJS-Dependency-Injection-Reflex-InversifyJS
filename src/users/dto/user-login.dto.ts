// DTO – Data Transfer Object – это класс, который описывает данные. Вместо интерфейса можно использовать класс для того, чтобы потом применять к нему декораторы и с помощью InversifyJS сделать Dependency Injection.

import { IsEmail, IsString } from 'class-validator';

export class UserLoginDto {
	@IsEmail({}, { message: 'Неверно указан email' })
	email: string;

	@IsString({ message: 'Не указан пароль' })
	password: string;
}

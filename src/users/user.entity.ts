// Entity – это бизнес-единица, которая описывает реальный бизнес-объект в виде класса, у которого внутри «зашито» описание бизнес-объекта и его методы.

import { hash } from 'bcryptjs';

export class User {
	// В _password будем хранить не сам пароль, а его хэш
	private _password: string;

	constructor(private readonly _email: string, private readonly _name: string) {}

	get email(): string {
		return this._email;
	}

	get name(): string {
		return this._name;
	}

	get password(): string {
		return this._password;
	}

	// Метод не может быть сеттером, т.к. мы решили, что он будет кодировать паоль асинхронно. А сеттреы - синхронные
	// salt - это модфикатор, который усложняет хэширование
	public async setPassword(pass: string, salt: number): Promise<void> {
		this._password = await hash(pass, salt);
	}
}

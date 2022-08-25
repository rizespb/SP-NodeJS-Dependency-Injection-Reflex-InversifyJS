// Entity – это бизнес-единица, которая описывает реальный бизнес-объект в виде класса, у которого внутри «зашито» описание бизнес-объекта и его методы.

import { compare, hash } from 'bcryptjs';

export class User {
	// В _password будем хранить не сам пароль, а его хэш
	private _passwordHash: string;

	constructor(
		private readonly _email: string,
		private readonly _name: string,
		passwordHash?: string,
	) {
		if (passwordHash) {
			this._passwordHash = passwordHash;
		}
	}

	get email(): string {
		return this._email;
	}

	get name(): string {
		return this._name;
	}

	get password(): string {
		return this._passwordHash;
	}

	// Метод не может быть сеттером, т.к. мы решили, что он будет кодировать паоль асинхронно. А сеттреы - синхронные
	// salt - это модфикатор, который усложняет хэширование
	public async setPassword(pass: string, salt: number): Promise<void> {
		this._passwordHash = await hash(pass, salt);
	}

	public async comparePassword(pass: string): Promise<boolean> {
		// compare из bcryptjs
		// Сравнит переданный пароль с ранее закодированным хэшем
		const res = await compare(pass, this._passwordHash);

		return res;
	}
}

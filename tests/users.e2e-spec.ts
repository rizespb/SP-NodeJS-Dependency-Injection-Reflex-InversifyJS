import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';

let application: App;

beforeAll(async () => {
	const { app } = await boot;

	application = app;
});

describe('Users e2e', () => {
	it('Register - error', async () => {
		// Передаем инстанс app express
		// Должен вернуться ответ с ошибкой, т.к. не передаем name
		const res = await request(application.app).post('/users/register').send({
			email: 'a@a111.ru',
			password: '1',
		});

		expect(res.statusCode).toBe(422);
	});

	it('Login - success', async () => {
		// Передаем инстанс app express
		// Передаем логин и пароль, которые уже существуют в БД. Мы их там завели ранее в процессе разработки приложения
		const res = await request(application.app).post('/users/login').send({
			email: 'test@test.com',
			password: 'some_password',
		});

		expect(res.body.jwt).not.toBeUndefined();
	});

	it('Login - error', async () => {
		// Передаем инстанс app express
		// Передаем неверный пароль, который отличатеся от того, что уже существуют в БД. Мы их там завели ранее в процессе разработки приложения
		const res = await request(application.app).post('/users/login').send({
			email: 'test@test.com',
			password: 'wrong_password',
		});

		expect(res.statusCode).toBe(401);
	});

	it('Info - success', async () => {
		// Вначале логинимся
		const login = await request(application.app).post('/users/login').send({
			email: 'test@test.com',
			password: 'some_password',
		});

		// Отправляем запрос на /users/info с заголовком Authorization с правильным содержимым
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', `Bearer ${login.body.jwt}`);

		expect(res.body.email).toBe('test@test.com');
	});

	it('Info - error', async () => {
		// Вначале логинимся
		const login = await request(application.app).post('/users/login').send({
			email: 'test@test.com',
			password: 'some_password',
		});

		// Отправляем запрос на /users/info с заголовком Authorization с НЕправильным содержимым
		const res = await request(application.app).get('/users/info').set('Authorization', `Bearer 1`);

		expect(res.statusCode).toBe(401);
	});
});

// Останавливаем сервер после тестов. Если этого не сделать, Jest напонит об открытом сервере
afterAll(() => {
	application.close();
});

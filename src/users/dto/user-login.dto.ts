// DTO – Data Transfer Object – это класс, который описывает данные. Вместо интерфейса можно использовать класс для того, чтобы потом применять к нему декораторы и с помощью InversifyJS сделать Dependency Injection.

export class UserLoginDto {
	email: string;
	password: string;
}

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	// Чтобы видеть детальный output
	verbose: true,
	preset: 'ts-jest',

	// Паттерн для поиска файлов с E2E-тестами
	testRegex: '.e2e-spec.ts$',
};

export default config;

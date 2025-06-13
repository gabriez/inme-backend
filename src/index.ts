import app from './app';
import AppDataSource from './database/appDataSource';

try {
	await AppDataSource.initialize();
	console.log('Data Source has been initialized!');

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const PORT = app.get('port');

	app.listen(PORT);
	console.log(`server listening on port ${PORT}`);
} catch (error) {
	console.log('Error during application initialization', error);
}

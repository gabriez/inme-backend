import type { Express } from 'express';

import { Router } from 'express';

// Routes
import { authRoutes } from './authRouters';
import { swaggerDocs } from './swagger';
import { userRouters } from './userRouters';

export const routes = (app: Express): Express => {
	const router = Router();

	return app.use(
		'/api/v1.0',
		router.use('/auth', authRoutes()),
		router.use('/user', userRouters()),
		router.use('/docs', swaggerDocs()),
	);
};

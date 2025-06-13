import { Router } from 'express';
import SwaggerUI from 'swagger-ui-express';

import { Docs, DocsJSON } from '../controllers/swaggerController';

export const swaggerDocs = () => {
	const router = Router();

	router.use('/', SwaggerUI.serve, Docs);

	router.get('/documentation.json', DocsJSON);

	return router;
};

import express from 'express';

const router = express.Router();

import * as errorController  from '../controllers/error.controller.js';

router.use(errorController.notFound);
router.use(errorController.handleError);

export default router;

import { Router } from "express";
import * as detectController from './detect.controller.js';

const router = Router();

router.post('/', detectController.detectObjects);
router.get('/history', detectController.getHistory);
router.get('/stats', detectController.getStats);

export default router;

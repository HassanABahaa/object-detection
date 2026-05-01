import { Router } from "express";
import * as detectController from './detect.controller.js';
import { upload } from "../../utils/multer.js";

const router = Router();

// Accept 'image' as a field (could be a file or a string in body)
router.post('/', upload.single('image'), detectController.detectObjects);
router.get('/history', detectController.getHistory);
router.get('/stats', detectController.getStats);

export default router;

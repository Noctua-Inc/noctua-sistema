import express from 'express';
import authController from '../controller/authController.js';


const router = express.Router();

router.post('/', authController.autenticar);

export default router;
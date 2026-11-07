import express from 'express';
import { signup, login, verify, getAuthConfig } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', verify);
router.get('/config', getAuthConfig);

export default router;

import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT'

const router = express.Router();

//컨트롤러 가기전에 무조건 extractJWT거치도록 
router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/get/all', controller.getAllUsers);

export = router;

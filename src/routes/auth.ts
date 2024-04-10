import { Router } from 'express';
import *  as authCtrl from '../controllers/auth/auth.js';
import passport from 'passport';
const authRouter : Router = Router();

authRouter.post('/signup', authCtrl.signup);
authRouter.post('/login', authCtrl.login);
authRouter.get('/logout', passport.authenticate('jwt', {session:false}), authCtrl.logout);
authRouter.get('/email-validation', authCtrl.emailValidation);
authRouter.get('/reset_password_request', authCtrl.resetPasswordRequest);
authRouter.post('/reset_password', authCtrl.resetPassword);
authRouter.post('/token', passport.authenticate('jwt', {session:false}), authCtrl.token);

export default authRouter;

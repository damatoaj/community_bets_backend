import { Router } from 'express';
import *  as userCtrl from '../controllers/user/user.js';
import passport from 'passport';

const userRouter = Router();

userRouter.get('/user/:id', passport.authenticate('jwt', { session: false }), userCtrl.getUser);

export default userRouter;
import { Router, Request, Response, NextFunction } from 'express';
import *  as userCtrl from '../controllers/user/user.js';
import passport from 'passport';
import { BlackListedToken, BlackListedTokenModel } from '../models/blackListedTokens.js';

async function checkToken(req: Request, res: Response, next: NextFunction) {
    const BLT : BlackListedToken | null = await BlackListedTokenModel.findOne({token: req.headers['authorization']?.split(' ')[1]})
    if (!BLT)   res.redirect('/');

};

const userRouter = Router();

userRouter.get('/user/:id', passport.authenticate('jwt', { session: false }), userCtrl.getUser);
userRouter.patch('/user/:id', passport.authenticate('jwt', { session: false }), userCtrl.patchUser);
userRouter.post('/user/deactivate/:id', passport.authenticate('jwt', { session: false }), userCtrl.deactivateUser);

export default userRouter;
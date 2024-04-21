import { Router, Request, Response, NextFunction } from 'express';
import *  as walletCtrl from '../controllers/wallet/wallet.js';
import passport from 'passport';
import { BlackListedToken, BlackListedTokenModel } from '../models/blackListedTokens.js';

async function checkToken(req: Request, res: Response, next: NextFunction) {
    const BLT : BlackListedToken | null = await BlackListedTokenModel.findOne({token: req.headers['authorization']?.split(' ')[1]})
    if (!BLT)   res.redirect('/');

};

const walletRouter = Router();

walletRouter.get('/wallet/:id', passport.authenticate('jwt', { session: false }), walletCtrl.getWallet);

export default walletRouter;
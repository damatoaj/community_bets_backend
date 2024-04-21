import { Router, Request, Response, NextFunction } from 'express';
import *  as walletCtrl from '../controllers/wallet/wallet.js';
import passport from 'passport';

const walletRouter = Router();

walletRouter.get('/wallet/:id', passport.authenticate('jwt', { session: false }), walletCtrl.getWallet);

export default walletRouter;
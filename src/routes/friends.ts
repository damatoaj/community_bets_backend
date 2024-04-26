import passport from 'passport';
import { Router, Request, Response, NextFunction } from 'express';
import * as friendsCtrl from '../controllers/friends/friends.js';

const friendsRouter = Router();

friendsRouter.get('/friends/:id', passport.authenticate('jwt', { session: false }), friendsCtrl.getMyFriends);
friendsRouter.post('/friends/:id', passport.authenticate('jwt', { session: false }), friendsCtrl.addFriend);
friendsRouter.delete('/friends/:id', passport.authenticate('jwt', { session: false }), friendsCtrl.cancelFriendRequest)
export default friendsRouter;
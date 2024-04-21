import { Friends, FriendsModel } from '../../models/friends.js';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

const getMyFriends = async (req: Request, res: Response) => {
    try {
        console.log(req.query)
        console.log(req.params)
        let friends : Friends | null = await FriendsModel.findOne({ userId: req.params.id });
        let status = 200;
        if (!friends) {
            friends = await new FriendsModel({
                _id : new mongoose.Types.ObjectId(),
                userId: req.params.id,
                friends: []
            });
            await friends.save();
            status = 201;
        };
        res.status(status).send(friends);
    } catch(e: unknown) {
        if (e instanceof Error) {
            if (e.message === 'Problem Retrieving User') {
                res.status(404).send(e.message);
            } else if (e.message === 'Unauthorized Request'){
                res.status(401).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    };
};

export {
    getMyFriends
}
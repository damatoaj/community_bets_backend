import { Friends, FriendsModel, IF } from '../../models/friends.js';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel, User } from '../../models/user.js';
import { validateIncomingUser } from '../user/user.js';
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

const addFriend = async (req: Request, res:Response) => {
    try {
        console.log(req, '<--request')
        const { p, u } = validateIncomingUser(req);
        if (!p || !u) throw new Error('Invalid Parameters');
        console.log(p, u);
        let friend : User | null = await UserModel.findById(p);
        let user : User | null = await UserModel.findById(u);

        if (!friend || !user) throw new Error('Problem Retrieving User');

        let friends : Friends | null = await FriendsModel.findOne({userId : u});


        let obj : IF = { 
            friendId: friend._id, 
            status: 0, 
            username: friend['username'], 
            avatar: friend['avatar'] || ''
        };

        let status;

        if(!friends) {
            friends = await new FriendsModel({
                _id : new mongoose.Types.ObjectId(),
                userId: req.params.id,
                friends: [obj]
            }).save();
            status = 201;
        } else {
            let f : IF[] = friends.friends.filter((f)=> f.friendId.toString() === p);
            if (f.length > 0) {
                obj = f[0];
                status = 200;
            } else {
                friends.friends.push(obj);
                await friends.save();
                status = 201;
            }
        };
        res.status(201).send(obj);
    } catch(e) {
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
    getMyFriends,
    addFriend
}
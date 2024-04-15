import { UserModel } from '../../models/user.js';
import { Request, Response } from 'express';

const getUser = async (req : Request, res: Response) => {
    try {
        let u : any = req.user;
        let p : any = req.params;

        if (!p.id || (p._id && typeof p.id !== 'string')) {
            throw new Error('Invalid Request')
        };

        if (!u._id || (u._id && typeof u._id !== 'string')) {
            throw new Error('Invalid Request')
        };

        let user : any | null = null;

        if (u._id === p.id) {
            //return the user their own data
            user = await UserModel.findById(p.id).select([
                'email',
                'username',
                '_id',
                'first_name',
                'last_name',
                'address',
                'birthday',
                'phone',
            ]);
        } else {
            user = await UserModel.findById(p.id).select([
                'username',
                'first_name',
                'last_name',
                'birthday'
            ]);
        };
        if (!user || user === null) throw new Error('Problem Retrieving User');

        res.status(200).send({user});
    } catch (e: unknown) {
        console.log(e)
        if (e instanceof Error) {
            if (e.message === 'Problem Retrieving User') {
                res.status(404).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    };
};

const patchUser = (req : Request, res: Response) => {};

const deleteUser = (req : Request, res: Response) => {};

const deactivateUser = (req : Request, res: Response) => {};

const reactivateUser = (req : Request, res: Response) => {};

export {
    getUser
}
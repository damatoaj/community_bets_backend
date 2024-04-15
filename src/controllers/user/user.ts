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

        if (u._id === p.id) {
            //return the user their own data
            const self = await UserModel.findById(p.id).select([
                'email',
                'username',
                '_id',
                'first_name',
                'last_name',
                'address',
                'birthday',
                'phone',
            ]);

            if (!self) throw new Error('Problem Retrieving Your Data');

            res.status(200).send({self});
        } else {
            const friend = await UserModel.findById(p.id).select([
                'username',
                'first_name',
                'last_name',
                'birthday'
            ]);

            if (!friend) throw new Error('Cannot find friend');

            res.status(200).send({friend});
        };
    } catch (e: any) {
        res.send(e)
    }
};

const patchUser = (req : Request, res: Response) => {};

const deleteUser = (req : Request, res: Response) => {};

const deactivateUser = (req : Request, res: Response) => {};

const reactivateUser = (req : Request, res: Response) => {};

export {
    getUser
}
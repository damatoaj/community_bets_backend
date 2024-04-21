import { Request, Response, NextFunction } from 'express';
import { Wallet, WalletModel } from '../../models/wallets.js';
import { validateIncomingUser } from '../user/user.js';

const getWallet = async (req : Request, res: Response) => {
    try {
        const { p, u } = validateIncomingUser(req);
        if (p !== u) throw new Error('Invalid Credentials');
        
        let wallet : Wallet | null = await WalletModel.findOne({userID:p});
        let status : number = 200;
        if (!wallet) {
            wallet = await new WalletModel({userID:p, points:0, methods:[{title:'Manual'}]});
            status = 201;
        };

        if(!wallet) throw new Error("Could Not Find Wallet");

        res.status(status).send({ wallet });

    } catch (e: unknown) {
        console.error(e)
        if (e instanceof Error) {
            if (e.message === 'Could Not Find Wallet') {
                res.status(404).send(e.message);
            } else if (e.message == 'Invalid Credentials') {
                res.status(401).send(e.message);
            } else {
                res.status(400).send(e.message);
            };
        };
    };
};

export {
    getWallet
};
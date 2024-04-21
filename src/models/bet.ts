import{ Schema, model, ObjectId, InferSchemaType, Document } from "mongoose";
//Creating Mongoose database models requires up to five steps
//1. Define a typescript interface


interface IBet extends Document {
    _id: ObjectId;
    users: [{
        u: ObjectId, 
        status: 0 | 1 | 2 //unknown, accepted, rejects
    }];
    totalPoints: number;
    wager: number;
    event: string; //the event ID
    conditions: []
    finalized: boolean;
    winners: [];
    losers: [];
    type: 'Manual'
};

//2. Define options if applicable
const options = {
    timestamps: true
};

//3. create the Mongoose Schema
const betSchema = new Schema<IBet>({
    _id: {type: String, required: true },
    users: {type: [], required: true },
    totalPoints: {type: Number, required: true},
    wager: {type: Number, requred: true},
    event: {type: String, required: true},
    conditions: {type: [], required: true},
    finalized: {type: Boolean, required: true}
}, options);

type Bet = InferSchemaType<typeof betSchema>;

//4. Create a model
const BetModel = model<IBet>('Wallet', betSchema);

export {
    BetModel,
    Bet
}
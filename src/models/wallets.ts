import{ Schema, model, ObjectId, InferSchemaType, Document } from "mongoose";
//Creating Mongoose database models requires up to five steps
//1. Define a typescript interface
interface FundingOption extends Document {
    _id: ObjectId;
    title: string;
};

interface IWallet extends Document {
    _id: ObjectId;
    userID: ObjectId;
    points: number;
    methods: [FundingOption];
};

//2. Define options if applicable
const options = {
    timestamps: true
};

//3. create the Mongoose Schema
const walletSchema = new Schema<IWallet>({
    _id: {type: String, required: true },
    userID: {type: String, required: true },
    points: {type: Number, required: true},
    methods: {type: [], required: true}
}, options);

type Wallet = InferSchemaType<typeof walletSchema>;

//4. Create a model
const WalletModel = model<IWallet>('Wallet', walletSchema);

export {
    WalletModel,
    Wallet
}
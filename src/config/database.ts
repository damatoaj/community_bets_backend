import dotenv from 'dotenv';
import mongoose, { ConnectOptions, Connection } from 'mongoose';


dotenv.config();

const database : string = process.env['APP_DB'] || 'mongodb://127.0.0.1:27017/community-bets';

mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true
} as ConnectOptions)
.then((res) => {
    console.log(
      'Connected to Distribution API Database - Initial Connection'
    );
  })
.catch((err) => {
console.error(
    `Initial Distribution API Database connection error occured -`,
    err
);
});

//shortcut to mongoose.connection object
const db : Connection = mongoose.connection;

db.on('connected', ()=> {
    console.log(`Connected to MongoDB at ${db.host}:${db.port}`)
})
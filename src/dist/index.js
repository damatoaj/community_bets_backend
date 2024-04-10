import express from 'express';
import authRouter from './routes/auth';
const app = express();
const port = process.env['PORT'] || 3000;
app.get('/', (res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Welcome to Community Bets');
});
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', authRouter);
// Add this error handling middleware
// app.use((err: Error, res: Response) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong');
// });
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

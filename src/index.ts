import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import cookieParser from "cookie-parser";
import { UserRouter } from './routes/UserRoutes';
import { ContentRouter } from './routes/ContentRoutes';
import { AvatarRouter } from './routes/AvatarRoutes';

const app = express();

app.use(cookieParser());
app.use(express.json());


const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://letmerecall.vercel.app',
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use("/api/v1/auth/user", UserRouter);
app.use("/api/v1/content" , ContentRouter);
app.use("/api/v1/avatar", AvatarRouter);

app.get("/", (req, res) => {
    res.send("LetMeRecall Server is up!!")
})

app.listen(PORT, () => {
    console.log(`BACKEND IS HOSTED : http://localhost:${PORT}`)
});
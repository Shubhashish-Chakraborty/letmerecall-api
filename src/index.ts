import './utils/passport';
import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import cookieParser from "cookie-parser";
import { UserRouter } from './routes/UserRoutes';
import session from 'express-session';
import passport from 'passport';
import { ContentRouter } from './routes/ContentRoutes';
import { AvatarRouter } from './routes/AvatarRoutes';
import { OauthRouter } from './routes/oauthRoutes';

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'defaultsecret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
        },
    })
);


// Passport middlewares
app.use(passport.initialize());
app.use(passport.session());


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
app.use("/api/v1/content", ContentRouter);
app.use("/api/v1/avatar", AvatarRouter);
app.use("/auth" , OauthRouter);

app.get("/", (req, res) => {
    res.send("LetMeRecall Server is up!!")
})

app.listen(PORT, () => {
    console.log(`BACKEND IS HOSTED : http://localhost:${PORT}`)
});
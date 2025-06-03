import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../db/prisma';
import { VerifyCallback } from 'passport-oauth2';
import { generateHashedPassword } from './generateHash';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error('Missing OAuth credentials in environment variables');
}

// Serialize & Deserialize user
passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any).id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Google Strategy
passport.use(
    'google',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${BASE_URL}/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    done(new Error('No email found in Google profile'));
                    return
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            username: profile.displayName || `user-${Math.random().toString(36).substring(2, 9)}`,
                            password: await generateHashedPassword(),
                            isMailVerified: true,
                            provider: 'google',
                            providerId: profile.id,
                        },
                    });
                }

                done(null, user);
                return
            } catch (err) {
                done(err as Error);
                return
            }
        }
    )
);

// passport.use(
//     'google',
//     new GoogleStrategy(
//         {
//             clientID: GOOGLE_CLIENT_ID,
//             clientSecret: GOOGLE_CLIENT_SECRET,
//             callbackURL: `${BASE_URL}/auth/google/callback`,
//         },
//         async (_accessToken, _refreshToken, profile, done) => {
//             try {
//                 const email = profile.emails?.[0]?.value;
//                 if (!email) {
//                     return done(new Error('No email found in Google profile'));

//                 }

//                 const existingUser = await prisma.user.findUnique({
//                     where: { email },
//                 });

//                 if (existingUser) {
//                     return done(null, existingUser);
//                 }

//                 const newUser = await prisma.user.create({
//                     data: {
//                         email,
//                         username: profile.displayName || `user-${Math.random().toString(36).substring(2, 9)}`,
//                         password: await generateHashedPassword(),
//                         isMailVerified: true,
//                         provider: 'google',
//                         providerId: profile.id,
//                     },
//                 });

//                 return done(null, newUser);
//             } catch (err) {
//                 return done(err as Error);
//             }
//         }
//     )
// );

/* GitHub Strategy */

passport.use(
    'github',
    new GitHubStrategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: `${BASE_URL}/auth/github/callback`,
        },
        async (_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;

                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = await prisma.user.create({
                    data: {
                        email,
                        username: profile.username || `user-${Math.random().toString(36).substring(2, 9)}`,
                        password: await generateHashedPassword(),
                        isMailVerified: true,
                        provider: 'github',
                        providerId: profile.id,
                    },
                });

                return done(null, newUser);
            } catch (err) {
                return done(err as Error);
            }
        }
    )
);
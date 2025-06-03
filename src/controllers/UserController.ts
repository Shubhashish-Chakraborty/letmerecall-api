import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import { signinValidationSchema, signupValidationSchema } from "../utils/zodSchema";
import prisma from "../db/prisma";
import { JWT_USER_SECRET } from "../config";

export const signup = async (req: Request, res: Response) => {
    try {
        // Input Validation Via ZOD:

        const result = signupValidationSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }

        const { username, email, password } = result.data;

        // Checking if user already exists:

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (existingUser) {
            res.status(400).json({
                message: "User already exists in SWS Database!!"
            });
            return;
        }

        // Hashing the password:

        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating the User:

        const USER = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        });

        res.status(200).json({
            message: `${USER.username} successfully signed up!!`,
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something Went Wrong, Please Try Again Later"
        });
    }
}

export const signin = async (req: Request, res: Response) => {
    try {
        const result = signinValidationSchema.safeParse(req.body);

        // If validation fails, return an error
        if (!result.success) {
            res.status(400).json({
                message: "Validation error",
                errors: result.error.flatten().fieldErrors,
            });
            return;
        }

        const { email, password } = result.data;

        // Find the user in the database
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(400).json({
                message: "User Not Found"
            });
            return;
        }

        // Compare password with hashed password in DB
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            res.status(401).json({
                message: "Incorrect Password!"
            });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_USER_SECRET,
            {
                expiresIn: "4d" // Token expires in 4 day
            }
        );

        // Set the JWT token as an HTTP-only cookie

        res.status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development", // Secure in production
                sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // Allow cross-site cookies
                maxAge: 4 * 24 * 60 * 60 * 1000, // 4 days
                path: "/"
            })
            .json({
                success: true,
                message: "User Logged In Successfully!",
                user: {
                    id: user.id,
                    email: user.email
                }
            });

        return;
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({
            message: "Something Went Wrong, Please Try Again Later"
        });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
        res.status(200).json({
            message: "User Logged Out Successfully!"
        });
        return
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({
            error: "Something went wrong while logging out."
        });
        return
    }
}

export const me = async (req: Request, res: Response) => {
    try {
        if (!(req as any).user) {
            res.status(401).json({
                message: "ACCESS DENIED"
            })
            return
        }

        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            res.status(400).json({
                message: "Sorry User Not Found!"
            })
            return
        }

        const finalUserData = {
            username: user?.username,
            email: user?.email,
            // isMailVerified: user?.isMailVerified,
            userAddedAt: user?.UserAddedAt
        }

        res.status(200).json({
            finalUserData
        })

    } catch (error) {
        res.status(500).json({
            message: 'Something Went Wrong, Please Try Again Later',
            error
        });
    }
}

export const session = async (req: Request, res: Response) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(200).json({
                message: {
                    isAuthenticated: false,
                    user: null
                }
            });
            return
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_USER_SECRET) as { id: string, email: string };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                isMailVerified: true,
                provider: true
            }
        });

        if (!user) {
            res.status(200).json({
                message: {
                    isAuthenticated: false,
                    user: null
                }
            });
            return
        }

        res.status(200).json({
            message: {
                isAuthenticated: true,
                user: user
            }
        });
        return
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(200).json({
            message: {
                isAuthenticated: false,
                user: null
            }
        });
        return
    }
};


// export const session = (req: Request, res: Response) => {
//     res.status(200).json({
//         message: {
//             isAuthenticated: true,
//             user: (req as any).user
//         }
//     })
// }

export const getAllUsers = async (req: Request, res: Response) => {
    const USERS = await prisma.user.findMany();
    // let finalUserArray: UserResponse[] = [];

    let finalUserArray: {
        id: String;
        username: string;
        email: string;
        // isMailVerified: boolean;
        userAddedAt: Date;
    }[] = [];

    USERS.forEach((user: {
        id: string;
        username: string;
        email: string;
        // isMailVerified: boolean;
        UserAddedAt: Date;
    }) => {
        finalUserArray.push({
            id: user.id,
            username: user.username,
            email: user.email,
            // isMailVerified: user.isMailVerified,
            userAddedAt: user.UserAddedAt
        });
    });

    res.json({
        finalUserArray
    })
}
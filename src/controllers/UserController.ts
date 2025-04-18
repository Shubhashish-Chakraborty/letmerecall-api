import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { signupValidationSchema } from "../utils/zodSchema";
import prisma from "../db/prisma";

export const signup = async (req:Request , res:Response) => {
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

        const {username , email , password} = result.data;

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
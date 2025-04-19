import { Request, Response } from "express";
import { contentValidationSchema } from "../utils/zodSchema";
import prisma from "../db/prisma";
import { ContentType } from "@prisma/client";

export const createContent = async (req: Request, res: Response) => {
    try {
        // Input Validation Via ZOD
        const result = contentValidationSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
            return
        }

        const { title, type, description, url, images } = result.data;
        const userId = (req as any).user.id;

        // Create content in database
        const newContent = await prisma.content.create({
            data: {
                title,
                type: type as ContentType,
                description,
                url,
                userId,
                images: images ? {
                    create: images.map(img => ({
                        publicId: img.publicId,
                        url: img.url,
                        userId
                    }))
                } : undefined
            },
            include: {
                images: true
            }
        });

        res.status(200).json({
            message: "Content created successfully!!",
            newContent
        })
        return;

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, PLease Try Again Later"
        });
        return;
    }
}

export const getContent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const content = await prisma.content.findFirst({
            where: {
                id,
                userId
            },
            include: {
                images: true
            }
        });

        if (!content) {
            res.status(400).json({
                // success: false,
                message: 'Content not found!'
            });
            return;
        }

        res.status(200).json({
            message: "Content fetched successfully!!",
            content
        });
        return;

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, Please Try Again Later"
        });
        return;
    }
}

export const updateContent = (req: Request, res: Response) => {

}

export const deleteContent = (req: Request, res: Response) => {


}
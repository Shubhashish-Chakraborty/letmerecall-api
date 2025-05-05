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
        const userId = (req as any).user.id;

        const contents = await prisma.content.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            contents
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, Please Try Again Later"
        });
    }
};

export const updateContent = (req: Request, res: Response) => {

}

export const deleteContent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // First check if content belongs to user
        const content = await prisma.content.findFirst({
            where: { id, userId }
        });

        if (!content) {
            res.status(404).json({
                success: false,
                message: "Content not found or you don't have permission to delete it"
            });
            return;
        }

        // Delete associated images first if they exist
        await prisma.contentImage.deleteMany({
            where: { contentId: id }
        });

        // Then delete the content
        await prisma.content.delete({
            where: { id }
        });

        res.status(200).json({
            success: true,
            message: "Content deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong, Please Try Again Later"
        });
    }
};
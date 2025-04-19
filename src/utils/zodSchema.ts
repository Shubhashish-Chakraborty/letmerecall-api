import { z } from "zod";

export const signupValidationSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

export const signinValidationSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});


const ContentTypes = ["LINK", "YOUTUBE", "TWEET", "DOCUMENT", "IMAGE", "OTHER"] as const;

export const contentValidationSchema = z.object({

    // title, type, description(optional), url(optional), images(optional)

    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(100, { message: "Title must be at most 100 characters" }),

    type: z
        .enum(ContentTypes, {
            errorMap: () => ({ message: `Type must be one of: ${ContentTypes.join(", ")}` })
        }),

    description: z
        .string()
        .max(500, { message: "Description must be at most 500 characters" })
        .optional(),

    url: z
        .preprocess(
            (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
            z.string().url({ message: "URL must be a valid URL" }).optional()
        ),

    // For IMAGE type content (Cloudinary)
    images: z
        .array(
            z.object({
                publicId: z.string(),
                url: z.string().url()
            })
        )
        .optional(),


}).superRefine((data, ctx) => {
    // URL validation
    if (["LINK", "YOUTUBE", "TWEET"].includes(data.type) && !data.url) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "URL is required for LINK, YOUTUBE, and TWEET content types",
            path: ["url"]
        });
    }

    // Image validation
    if (data.type === "IMAGE" && (!data.images || data.images.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one image is required for IMAGE content type",
            path: ["images"]
        });
    }

    // Prevent URL for certain types
    if (["IMAGE", "DOCUMENT"].includes(data.type) && data.url) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `URL should not be provided for ${data.type} content type`,
            path: ["url"]
        });
    }
});
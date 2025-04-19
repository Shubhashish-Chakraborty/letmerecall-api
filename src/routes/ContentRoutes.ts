import { Router } from "express";
import { UserAuth } from "../middlewares/UserAuthentication";
import { createContent, deleteContent, getContent, updateContent } from "../controllers/ContentController";

export const ContentRouter = Router();

ContentRouter.post("/create-content" , UserAuth , createContent);
ContentRouter.get("/my-content" , UserAuth , getContent);
ContentRouter.put("/update-content" , UserAuth , updateContent);
ContentRouter.delete("/delete-content" , UserAuth , deleteContent);
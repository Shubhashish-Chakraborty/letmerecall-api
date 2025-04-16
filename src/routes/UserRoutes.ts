import { Router } from "express";
import { signup } from "../controllers/UserController";

export const UserRouter = Router();

UserRouter.post("/signup" , signup);
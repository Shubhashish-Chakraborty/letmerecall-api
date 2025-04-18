import { Router } from "express";
import { logout, signin, signup } from "../controllers/UserController";

export const UserRouter = Router();

UserRouter.post("/signup" , signup);
UserRouter.post("/signin" , signin);
UserRouter.post("/logout" , logout);
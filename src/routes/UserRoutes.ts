import { Router } from "express";
import { logout, me, signin, signup } from "../controllers/UserController";
import { UserAuth } from "../middlewares/UserAuthentication";

export const UserRouter = Router();

UserRouter.post("/signup" , signup);
UserRouter.post("/signin" , signin);
UserRouter.post("/logout" , logout);
UserRouter.get("/me" , UserAuth , me); // Protected!!
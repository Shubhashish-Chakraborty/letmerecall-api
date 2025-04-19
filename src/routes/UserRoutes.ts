import { Router } from "express";
import { getAllUsers, logout, me, session, signin, signup } from "../controllers/UserController";
import { UserAuth } from "../middlewares/UserAuthentication";

export const UserRouter = Router();

UserRouter.post("/signup" , signup);
UserRouter.post("/signin" , signin);
UserRouter.post("/logout" , logout);
UserRouter.get("/data" , getAllUsers);
UserRouter.get("/me" , UserAuth , me); // Protected!!
UserRouter.get("/session" , UserAuth , session) // Protected!!
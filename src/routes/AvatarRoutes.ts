import { Router } from 'express';
import { getAvatar, uploadAvatar } from '../controllers/AvatarController';
import { UserAuth } from '../middlewares/UserAuthentication';

export const AvatarRouter = Router();

AvatarRouter.post('/upload', UserAuth , uploadAvatar);
AvatarRouter.get("/get-avatar" , UserAuth , getAvatar)
import { Request, Response } from 'express';


export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
};

export const authFailure = (req: Request, res: Response) => {
  res.send('Failed to authenticate.');
};
import { Request, Response, NextFunction } from "express";

export function accept(req: Request, res: Response, next: NextFunction) {
  res.locals.acceptUser = true;
  next();
}

export function reject(req: Request, res: Response, next: NextFunction) {
  res.locals.acceptUser = false;
  next();
}

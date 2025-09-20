import { Request, Response, NextFunction } from "express";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  const expected = process.env.API_KEY || "dev-key";
  if (key !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

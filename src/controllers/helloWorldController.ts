import { Request, Response } from "express";

export const helloWorldController = async (req: Request, res: Response) => {
  res.send("Hello World!");
};

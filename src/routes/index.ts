import { Router } from "express";
import { helloWorldController } from "@/controllers/helloWorldController";

const router = Router();

router.get("/hello", helloWorldController);

// add routes here

export default router;

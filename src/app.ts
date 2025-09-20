import express from "express";
import { json } from "body-parser";
import routes from "@/routes";
import webhookRoutes from "./routes/webhook";
import conversationsRoutes from "./routes/conversations";
import { apiKeyMiddleware } from "./middleware/apiKey"; // Import the API key middleware

const app = express();

app.use(json());
app.use("/api", routes); // This is a general route, might not need API key
app.use("/api/webhook", apiKeyMiddleware, webhookRoutes); // Apply middleware to webhook routes
app.use("/api/conversations", apiKeyMiddleware, conversationsRoutes); // Apply middleware to conversations routes

export default app;

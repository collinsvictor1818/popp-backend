import express from "express";
import { json } from "body-parser";
import routes from "@/routes";
import webhookRoutes from "./routes/webhook";
import conversationsRoutes from "./routes/conversations";
import { apiKeyMiddleware } from "./middleware/apiKey";
import rateLimit from 'express-rate-limit'; // Import rateLimit

const app = express();

// Configure rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(json());
app.use("/api", routes); // This is a general route, might not need API key
app.use("/api/webhook", apiLimiter, apiKeyMiddleware, webhookRoutes); // Apply rate limiter and API key middleware
app.use("/api/conversations", apiLimiter, apiKeyMiddleware, conversationsRoutes); // Apply rate limiter and API key middleware

export default app;

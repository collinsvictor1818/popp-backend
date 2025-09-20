import express from "express";
import { json } from "body-parser";
import routes from "@/routes";
import webhookRoutes from "./routes/webhook"; // Import the new webhook routes

const app = express();

app.use(json());
app.use("/api", routes);
app.use("/api/webhook", webhookRoutes); // Mount the webhook routes

export default app;

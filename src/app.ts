import express from "express";
import { json } from "body-parser";
import routes from "@/routes";
import webhookRoutes from "./routes/webhook";
import conversationsRoutes from "./routes/conversations"; // Import the new conversations routes

const app = express();

app.use(json());
app.use("/api", routes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/conversations", conversationsRoutes); // Mount the conversations routes

export default app;

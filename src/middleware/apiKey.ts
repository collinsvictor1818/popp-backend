import { Request, Response, NextFunction } from 'express';

// For simplicity, we'll use an environment variable for the API key.
// In a real-world scenario, this might involve a database lookup or a more robust token validation.
const API_KEY = process.env.API_KEY;

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow requests without API_KEY in development environment for easier testing
  // TODO: Make this configurable or remove for production
  if (process.env.NODE_ENV === 'development' && !API_KEY) {
    console.warn("API_KEY is not set in development mode. Skipping API key validation.");
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized: X-API-Key header missing" });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid X-API-Key" });
  }

  next();
};
// server.js
import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";

// Routes imports
import authRoutes from "./routes/authRoutes.js";
import itemRoutes from "./routes/itemRoute.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

import { initSocket } from "./sockets/socketServer.js";

dotenv.config();
connectDB();

const app = express();

// IMPORTANT FOR DEPLOYMENT (Render/Vercel proxies)
app.set("trust proxy", 1);

// Ensure CORS runs before any rate limiters or route handlers so preflight requests get proper headers
// 2. LIISKA MEELAHA LOO OGGOL YAHAY (CORS ORIGINS)
const allowedOrigins = [
  process.env.FRONTEND_URL,        // optional: set this in Render to your frontend URL
  "https://baafin.vercel.app",        // URL-kaaga rasmiga ah ee Frontend Vercel
  "http://localhost:5173",            // Local pc-gaaga Vite
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Accept if origin is explicitly allowed
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

      // Accept frontend hosted on Render (e.g. <name>.onrender.com)
      try {
        const lc = origin.toLowerCase();
        if (lc.includes('.onrender.com')) return callback(null, true);
      } catch (e) { /* ignore */ }

      // Otherwise reject
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    // MAHADSANID: "PATCH" ayaa lagu daray halkan hoose si loogu oggolaado codsiyadaada ogeysiiska iyo wareejinta alaabta.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// SECURITY
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// RATE LIMIT
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests"
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts"
  }
});

app.use("/api", generalLimiter);

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/forgot", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// SANITIZE
// app.use(mongoSanitize());

console.log("Email service configured");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.get("origin")}`);
  next();
}); 

// File Paths & Uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);

// Root Route & Health Check
app.get("/", (req, res) => res.send("Baafin Backend API is running..."));
app.get("/api-health", (req, res) => res.json({ status: "ok", message: "Baafin API is healthy" }));

// Error Handling for 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route-kan lama helin." });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});
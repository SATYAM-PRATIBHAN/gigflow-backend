require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const setupSocketIO = require("./socket/socketHandler");

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration - supports multiple origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

console.log("🌐 Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) {
      console.log("✅ Request with no origin allowed");
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      console.log("✅ CORS allowed for origin:", origin);
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
  ],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Socket.io: Origin not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Setup Socket.io handlers
const userSockets = setupSocketIO(io);

// Make io and userSockets available to routes
app.set("io", io);
app.set("userSockets", userSockets);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/gigs", require("./routes/gigs"));
app.use("/api/bids", require("./routes/bids"));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GigFlow API is running",
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

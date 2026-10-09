require("./tracing");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const client = require("prom-client");
const logger = require("./config/logger");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

require("dotenv").config();

const Task = require("./models/Task");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP Request", {
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip
    });
  });

  next();
});

/*
 * ==========================================
 * PROMETHEUS METRICS
 * ==========================================
 */

// Collect default Node.js/system metrics
client.collectDefaultMetrics({
  prefix: "mern_taskmanager_",
});

// Count HTTP requests
const httpRequestCounter = new client.Counter({
  name: "mern_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

// Measure HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: "mern_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

/*
 * ==========================================
 * MIDDLEWARE
 * ==========================================
 */

app.use(cors());
app.use(express.json());

// HTTP metrics middleware
// HTTP metrics + centralized logging middleware
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    const route = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    // Prometheus metrics
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      duration
    );

    // ELK centralized logging
    logger.info("HTTP Request", {
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      ip: req.ip,
    });
  });

  next();
});

/*
 * ==========================================
 * ROUTES
 * ==========================================
 */

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

/*
 * ==========================================
 * HEALTH CHECK
 * ==========================================
 */

app.get("/api/health", async (req, res) => {
  const mongoState = mongoose.connection.readyState;

  if (mongoState === 1) {
    return res.status(200).json({
      status: "healthy",
      service: "backend",
      database: "connected",
    });
  }

  return res.status(503).json({
    status: "unhealthy",
    service: "backend",
    database: "disconnected",
  });
});

/*
 * ==========================================
 * PROMETHEUS METRICS ENDPOINT
 * ==========================================
 */

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

/*
 * ==========================================
 * BASIC API STATUS
 * ==========================================
 */

app.get("/", (req, res) => {
  res.json({
    message: "MERN DevOps Task Manager API",
    status: "running",
  });
});

/*
 * ==========================================
 * TASK ROUTES
 * ==========================================
 */

// Get logged-in user's tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Create task for logged-in user
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user.userId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Update logged-in user's task
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      {
        completed: req.body.completed,
      },
      {
        new: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Delete logged-in user's task
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/*
 * ==========================================
 * DATABASE + SERVER
 * ==========================================
 */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
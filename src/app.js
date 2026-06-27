"use strict";

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const { globalLimiter } = require("./middleware/rateLimiter");
const globalErrorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(mongoSanitize());
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api", globalLimiter);

const API = `/api/${process.env.API_VERSION || "v1"}`;
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/health`, healthRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "REST API Framework – Docs",
    swaggerOptions: { persistAuthorization: true, docExpansion: "none" },
  }),
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/", (req, res) =>
  res.json({
    success: true,
    message: "REST API Framework",
    docs: "/api-docs",
    health: `${API}/health`,
  }),
);

app.all("*", (req, res, next) =>
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`)),
);

app.use(globalErrorHandler);

module.exports = app;

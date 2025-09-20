import cors from "cors";
import express from "express";
import { historyRouter } from "./infrastructure/http/routes/history.router.js";
import { reportsRouter } from "./infrastructure/http/routes/reports.routes.js";
import { ticketRouter } from "./infrastructure/http/routes/ticket.routes.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false, // pon true solo si vas a usar cookies
  })
);
app.use(cors({
  origin: "http://localhost:5173",
  credentials: false, // ponlo en true solo si usas cookies
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ...tus otras rutas
app.use("/v1", historyRouter);
app.use("/v1", reportsRouter);
app.use("/v1", ticketRouter);


// export o listen(...)
export default app;

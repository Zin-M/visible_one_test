import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./types/express";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/user_routes";
import bookingRoutes from "./routes/booking_routes";
import authRoutes from "./routes/auth_routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});


app.use(errorHandler);

import http from "http";

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

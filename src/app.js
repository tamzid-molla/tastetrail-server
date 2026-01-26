import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import userRoute from "./features/user/userRoute.js"
import { errorHandlerMiddleware } from './middleware/errorHandler.js';

//middlewares 
app.use(cors({
    origin: [],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//coockie parser 
app.use(cookieParser());

// Define a route for the app
app.get("/", (req, res) => {
    res.json({message: "Server running Good"});
});

//others routes
app.use("/api/user", userRoute);

//Global error handler
app.use(errorHandlerMiddleware);

export default app;
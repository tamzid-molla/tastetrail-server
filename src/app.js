import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
import userRoute from "./features/user/userRoute.js"
import recipeRouter from "./features/recipe/recipeRoute.js";
import categoryRouter from "./features/category/categoryRoute.js";
import cuisineRouter from "./features/cuisine/cuisineRoute.js";
import reviewRouter from "./features/review/reviewRoute.js";
import mealPlanRouter from "./features/MealPlan/mealPlanRoute.js";
import { errorHandlerMiddleware } from './middleware/errorHandler.js';

//middlewares 
app.use(cors({
    origin: [],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//cookie parser 
app.use(cookieParser());

// Define a route for the app
app.get("/", (req, res) => {
    res.json({message: "Server running Good"});
});

//others routes
app.use("/api/user", userRoute);
app.use("/api/recipe", recipeRouter);
app.use("/api/category", categoryRouter)
app.use("/api/cuisine", cuisineRouter);
app.use("/api/review", reviewRouter);
app.use("/api/mealPlan", mealPlanRouter)

//Global error handler
app.use(errorHandlerMiddleware);

export default app;
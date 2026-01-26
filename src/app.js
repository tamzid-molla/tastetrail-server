import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

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


//Global error handler

export default app;
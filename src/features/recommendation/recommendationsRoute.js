import express from "express";
import { recommendations } from "./recommendationController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
const router = express.Router();

router.get("/personalized", isAuthenticated, recommendations);

export default router;

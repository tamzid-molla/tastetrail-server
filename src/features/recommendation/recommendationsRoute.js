import express from "express";
import { recommendations } from "./recommendationController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", isAuthenticated, recommendations);

export default router;

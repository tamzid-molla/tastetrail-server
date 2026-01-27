import express from "express";
import { createCategory,allCategory } from "./categoryController.js";
import adminOnly from "../../middleware/admin.js";
import isAuthenticated from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, adminOnly, createCategory);
router.get("/", isAuthenticated, adminOnly, allCategory);

export default router;

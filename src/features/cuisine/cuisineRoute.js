import express from "express";
import { createCuisine,deleteCuisine,updateCuisine,singleCuisine,allCuisines } from "./cuisineController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

router.post("/", isAuthenticated, adminOnly, createCuisine);
router.delete("/:id", isAuthenticated, adminOnly, deleteCuisine);
router.put("/:id", isAuthenticated, adminOnly, updateCuisine);
router.get("/:id", isAuthenticated, adminOnly, singleCuisine);
router.get("/", isAuthenticated, adminOnly, allCuisines);

export default router;

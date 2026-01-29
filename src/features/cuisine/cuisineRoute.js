import express from "express";
import {
  createCuisine,
  deleteCuisine,
  updateCuisine,
  singleCuisine,
  allCuisines,
  getCuisineCount,
} from "./cuisineController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

router.post("/", isAuthenticated, adminOnly, createCuisine);
router.delete("/:id", isAuthenticated, adminOnly, deleteCuisine);
router.put("/:id", isAuthenticated, adminOnly, updateCuisine);
// List cuisines is needed for normal users (filters)
router.get("/", isAuthenticated, allCuisines);
router.get("/count", isAuthenticated, adminOnly, getCuisineCount);
router.get("/:id", isAuthenticated, singleCuisine);

export default router;

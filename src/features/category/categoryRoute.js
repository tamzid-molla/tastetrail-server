import express from "express";
import {
  createCategory,
  allCategory,
  singleCategory,
  updateCategory,
  deleteCategory,
  getCategoryCount,
} from "./categoryController.js";
import adminOnly from "../../middleware/admin.js";
import isAuthenticated from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated, adminOnly, createCategory);
// List categories is needed for normal users (filters)
router.get("/", isAuthenticated, allCategory);
router.get("/count", isAuthenticated, adminOnly, getCategoryCount); // Get category count
router.get("/:id", isAuthenticated, singleCategory);
router.put("/:id", isAuthenticated, adminOnly, updateCategory);
router.delete("/:id", isAuthenticated, adminOnly, deleteCategory);

export default router;

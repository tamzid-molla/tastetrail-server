import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByRecipe,
  approveReview,
  rejectReview,
  getReviewCount,
} from "./reviewController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

router.post("/", isAuthenticated, createReview);
router.get("/:recipeID/approved", isAuthenticated, getReviewsByRecipe);
router.get("/", isAuthenticated, adminOnly, getAllReviews);
router.get("/count", isAuthenticated, adminOnly, getReviewCount); // Get review count
router.put("/:id", isAuthenticated, adminOnly, approveReview);
router.delete("/:id", isAuthenticated, adminOnly, rejectReview);

export default router;

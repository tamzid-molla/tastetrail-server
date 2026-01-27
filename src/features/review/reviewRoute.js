import express from "express";
import { createReview,getAllReviews,getReviewsByRecipe,approveReview, rejectReview } from "./reviewController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

router.post("/",isAuthenticated, createReview);
router.get("/:recipeID/approved",isAuthenticated, getReviewsByRecipe);
router.get("/", isAuthenticated, adminOnly, getAllReviews);
router.put("/:id", isAuthenticated, adminOnly, approveReview);
router.delete("/:id", isAuthenticated, adminOnly, rejectReview);



export default router;

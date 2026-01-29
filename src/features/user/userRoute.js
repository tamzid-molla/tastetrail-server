import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserCount,
  getAllUsers,
  updateUserRole,
  suspendUser,
  activateUser,
  getSavedRecipes,
  toggleSavedRecipe,
  getUserCookingStats,
  getUserNutritionSummary,
} from "./userController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";
import upload from "../../middleware/uploadMiddleware.js";
const router = express.Router();

router.post("/auth/register", upload.single("profilePhoto"), registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/me", isAuthenticated, getCurrentUser);
router.get("/auth/count", isAuthenticated, adminOnly, getUserCount); // Get user count
router.post("/auth/logout", isAuthenticated, logoutUser);

// Normal user: cookbook (saved recipes)
router.get("/saved", isAuthenticated, getSavedRecipes);
router.post("/saved/:recipeId", isAuthenticated, toggleSavedRecipe);

// User cooking stats
router.get("/cooking-stats", isAuthenticated, getUserCookingStats);

// User nutrition summary
router.get("/nutrition-summary", isAuthenticated, getUserNutritionSummary);

// Admin routes
router.get("/", isAuthenticated, adminOnly, getAllUsers); // Get all users
router.put("/:id/role", isAuthenticated, adminOnly, updateUserRole); // Update user role
router.put("/:id/suspend", isAuthenticated, adminOnly, suspendUser); // Suspend user
router.put("/:id/activate", isAuthenticated, adminOnly, activateUser); // Activate user

export default router;

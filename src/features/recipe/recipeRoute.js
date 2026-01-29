import express from "express";
import {
  createRecipe,
  deleteRecipe,
  getAllRecipes,
  getSingleRecipe,
  updateRecipe,
  getRecipeCount,
} from "./recipeController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

//add recipe
router.post("/add", isAuthenticated, adminOnly, upload.single("image"), createRecipe);
router.get("/all", isAuthenticated, getAllRecipes);
router.get("/count", isAuthenticated, adminOnly, getRecipeCount); // Get recipe count (Admin)
router.get("/single/:id", isAuthenticated, getSingleRecipe);
router.put("/update/:id", isAuthenticated, adminOnly, upload.single("image"), updateRecipe);
router.delete("/delete/:id", isAuthenticated, adminOnly, deleteRecipe);

export default router;

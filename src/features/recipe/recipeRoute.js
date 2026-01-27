import express from "express";
import { createRecipe, deleteRecipe, getAllRecipes, getSingleRecipe, updateRecipe } from "./recipeController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

//add recipe 
router.post("/add", isAuthenticated, adminOnly, createRecipe);
router.get("/all", getAllRecipes);
router.get("/single/:id", getSingleRecipe);
router.put("/update/:id", isAuthenticated, adminOnly, updateRecipe);
router.delete("/delete/:id", isAuthenticated, adminOnly, deleteRecipe);


export default router
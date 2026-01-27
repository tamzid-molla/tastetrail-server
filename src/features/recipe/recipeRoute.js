import express from "express";
import { createRecipe } from "./recipeController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/admin.js";

const router = express.Router();

//add recipe 
router.post("/add",isAuthenticated,adminOnly, createRecipe);


export default router
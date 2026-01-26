import express from "express";
import { createRecipe } from "./recipeController.js";
import isAuthenticated from "../../middleware/authMiddleware.js";

const router = express.Router();

//add recipe 
router.post("/add",isAuthenticated, createRecipe);


export default router
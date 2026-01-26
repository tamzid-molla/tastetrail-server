import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "./recipeModel.js";

export const createRecipe = asyncHandler(async (req, res, next) => {
    const { title, ingredients, instructions, category, cuisine } = req.body;
  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(category)) 
    return next(new ErrorHandler("Invalid category", 400));

  if (!mongoose.Types.ObjectId.isValid(cuisine))
    return next(new ErrorHandler("Invalid cuisine", 400));

//   const categoryExists = await Category.findById(category);
//   if (!categoryExists) return next(new ErrorHandler("Category not found", 404));

//   const cuisineExists = await Cuisine.findById(cuisine);
//   if (!cuisineExists) return next(new ErrorHandler("Cuisine not found", 404));

  const newRecipe = await Recipe.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Recipe created successfully",
    recipe: newRecipe,
  });
});
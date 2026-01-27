import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "./recipeModel.js";
import { Category } from "../category/categoryModel.js";
import Cuisine from "../cuisine/cuisineModel.js";

export const createRecipe = asyncHandler(async (req, res, next) => {
  const { title, ingredients, instructions, category, cuisine } = req.body;
  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(category)) return next(new ErrorHandler("Invalid category", 400));
  if (!mongoose.Types.ObjectId.isValid(cuisine)) return next(new ErrorHandler("Invalid cuisine", 400));
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new ErrorHandler("Category not found", 404));
  const cuisineExists = await Cuisine.findById(cuisine);
  if (!cuisineExists) return next(new ErrorHandler("Cuisine not found", 404));
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

//get all recipes
export const getAllRecipes = asyncHandler(async (req, res, next) => {
  const recipes = await Recipe.find({ status: "active" })
    .populate("category", "name _id")
    .populate("cuisine", "name _id")
    .populate("createdBy", "fullName email _id");
  res.status(200).json({
    success: true,
    recipes,
  });
});

//get single recipe
export const getSingleRecipe = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const validID = mongoose.Types.ObjectId.isValid(id);
  if (!id || !validID) return next(new ErrorHandler("Please provide a valid id", 400));
  const recipe = await Recipe.findById(id)
    .populate("category", "name _id")
    .populate("cuisine", "name _id")
    .populate("createdBy", "fullName email _id");
  if (!recipe) return next(new ErrorHandler("Recipe not found", 404));
  res.status(200).json({
    success: true,
    message: "Recipe fetched successfully",
    recipe,
  });
});

//update recipe
export const updateRecipe = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a recipe id", 400));
  const { title, ingredients, instructions, category, cuisine, cookingTime, calories, image, isFeatured } = req.body;

  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const recipe = await Recipe.findById(id);
  if (!recipe) return next(new ErrorHandler("Recipe not found", 404));

  // Update fields
  recipe.title = title;
  recipe.ingredients = ingredients;
  recipe.instructions = instructions;
  recipe.category = category;
  recipe.cuisine = cuisine;
  recipe.cookingTime = cookingTime;
  recipe.calories = calories;
  recipe.image = image;
  recipe.isFeatured = isFeatured;

  const updatedRecipe = await recipe.save();
  await updatedRecipe.populate([
    { path: "category", select: "name _id" },
    { path: "cuisine", select: "name _id" },
    { path: "createdBy", select: "fullName email _id" },
  ]);

  res.status(200).json({
    success: true,
    message: "Recipe updated successfully",
    recipe: updatedRecipe,
  });
});

//delete recipe
export const deleteRecipe = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a recipe id", 400));
  const recipe = await Recipe.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
  if (!recipe) return next(new ErrorHandler("Cannot delete recipe, please try again", 404));
  res.status(200).json({
    success: true,
    message: "Recipe deleted successfully",
  });
});

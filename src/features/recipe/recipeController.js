import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "./recipeModel.js";
import { Category } from "../category/categoryModel.js";
import Cuisine from "../cuisine/cuisineModel.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

export const getRecipeCount = asyncHandler(async (req, res, next) => {
  const count = await Recipe.countDocuments({ status: "active" });
  res.status(200).json({
    success: true,
    count,
  });
});

export const createRecipe = asyncHandler(async (req, res, next) => {
  // Handle FormData fields
  const title = req.body.title;
  const ingredients = JSON.parse(req.body.ingredients);
  const instructions = req.body.instructions;
  const category = req.body.category;
  const cuisine = req.body.cuisine;
  const cookingTime = req.body.cookingTime;
  const calories = req.body.calories;
  const isFeatured = req.body.isFeatured;

  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(category)) return next(new ErrorHandler("Invalid category", 400));
  if (!mongoose.Types.ObjectId.isValid(cuisine)) return next(new ErrorHandler("Invalid cuisine", 400));
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new ErrorHandler("Category not found", 404));
  const cuisineExists = await Cuisine.findById(cuisine);
  if (!cuisineExists) return next(new ErrorHandler("Cuisine not found", 404));

  // Handle image upload
  let imageUrl = "";
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "TasteTrailRecipes",
        quality: "auto",
        fetch_format: "auto",
      });
      imageUrl = result.secure_url;
      // Delete local file after uploading to Cloudinary
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return next(new ErrorHandler("Failed to upload image", 500));
    }
  }

  const newRecipe = await Recipe.create({
    title,
    ingredients,
    instructions,
    category,
    cuisine,
    cookingTime: cookingTime ? parseInt(cookingTime) : undefined,
    calories: calories ? parseInt(calories) : undefined,
    image: imageUrl,
    isFeatured: isFeatured === "true" || isFeatured === true,
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
  const { q } = req.query;

  let query = { status: "active" };

  // If search query exists, search in relevant fields
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } }, // Case insensitive search in title
      { "category.name": { $regex: q, $options: "i" } }, // Search in category name
      { "cuisine.name": { $regex: q, $options: "i" } }, // Search in cuisine name
      { ingredients: { $elemMatch: { $regex: q, $options: "i" } } }, // Search in ingredients
    ];
  }

  const recipes = await Recipe.find(query)
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

  // Handle FormData fields
  const title = req.body.title;
  const ingredients = JSON.parse(req.body.ingredients);
  const instructions = req.body.instructions;
  const category = req.body.category;
  const cuisine = req.body.cuisine;
  const cookingTime = req.body.cookingTime;
  const calories = req.body.calories;
  const isFeatured = req.body.isFeatured;

  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) return next(new ErrorHandler("Recipe not found", 404));

  // Handle image upload if new image is provided
  let imageUrl = recipe.image; // Keep existing image by default
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "TasteTrailRecipes",
        quality: "auto",
        fetch_format: "auto",
      });
      imageUrl = result.secure_url;
      // Delete local file after uploading to Cloudinary
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return next(new ErrorHandler("Failed to upload image", 500));
    }
  }

  // Update fields
  recipe.title = title;
  recipe.ingredients = ingredients;
  recipe.instructions = instructions;
  recipe.category = category;
  recipe.cuisine = cuisine;
  recipe.cookingTime = cookingTime ? parseInt(cookingTime) : undefined;
  recipe.calories = calories ? parseInt(calories) : undefined;
  recipe.image = imageUrl;
  recipe.isFeatured = isFeatured === "true" || isFeatured === true;

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

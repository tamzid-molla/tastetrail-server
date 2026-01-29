import mongoose from "mongoose";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "./recipeModel.js";
import { Category } from "../category/categoryModel.js";
import Cuisine from "../cuisine/cuisineModel.js";

export const getRecipeCount = asyncHandler(async (req, res, next) => {
  const count = await Recipe.countDocuments({ status: "active" });

  // Recipes created between last Friday and this Friday (inclusive)
  const now = new Date();
  const end = new Date(now);
  const day = end.getDay(); // 0 = Sun, 5 = Fri
  const diffToFriday = (5 - day + 7) % 7;
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + diffToFriday);

  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const weeklyCount = await Recipe.countDocuments({
    status: "active",
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({
    success: true,
    count,
    weeklyCount,
  });
});

export const createRecipe = asyncHandler(async (req, res, next) => {
  // Handle both JSON and FormData
  let title, ingredients, instructions, category, cuisine, cookingTime, calories, isFeatured, image;

  if (req.is("multipart/form-data")) {
    // Handle FormData
    title = req.body.title;
    ingredients = JSON.parse(req.body.ingredients);
    instructions = req.body.instructions;
    category = req.body.category;
    cuisine = req.body.cuisine;
    cookingTime = req.body.cookingTime;
    calories = req.body.calories;
    isFeatured = req.body.isFeatured;
    image = req.body.image;
  } else {
    // Handle JSON
    ({ title, ingredients, instructions, category, cuisine, cookingTime, calories, isFeatured, image } = req.body);
  }
  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(category)) return next(new ErrorHandler("Invalid category", 400));
  if (!mongoose.Types.ObjectId.isValid(cuisine)) return next(new ErrorHandler("Invalid cuisine", 400));

  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new ErrorHandler("Category not found", 404));

  const cuisineExists = await Cuisine.findById(cuisine);
  if (!cuisineExists) return next(new ErrorHandler("Cuisine not found", 404));

  // Validate Cloudinary URL if provided
  let imageUrl = "";
  if (image) {
    // Basic Cloudinary URL validation
    if (!image.startsWith("https://res.cloudinary.com/")) {
      return next(new ErrorHandler("Invalid Cloudinary image URL", 400));
    }
    imageUrl = image;
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
  const { q, category, cuisine, page = "1", limit = "12", sort = "latest" } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumRaw = parseInt(limit, 10) || 12;
  const limitNum = Math.min(Math.max(limitNumRaw, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const query = { status: "active" };

  // Filters
  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) return next(new ErrorHandler("Invalid category", 400));
    query.category = category;
  }
  if (cuisine) {
    if (!mongoose.Types.ObjectId.isValid(cuisine)) return next(new ErrorHandler("Invalid cuisine", 400));
    query.cuisine = cuisine;
  }

  // Search (name or ingredient)
  if (q && String(q).trim()) {
    const term = String(q).trim();
    query.$or = [
      { title: { $regex: term, $options: "i" } },
      { ingredients: { $elemMatch: { $regex: term, $options: "i" } } },
    ];
  }

  // Sorting
  let sortQuery = { createdAt: -1 };
  if (sort === "trending") sortQuery = { averageRating: -1, totalReviews: -1, createdAt: -1 };
  if (sort === "topRated") sortQuery = { averageRating: -1, createdAt: -1 };

  const total = await Recipe.countDocuments(query);

  const recipes = await Recipe.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .populate("category", "name _id")
    .populate("cuisine", "name _id")
    .populate("createdBy", "fullName email _id");

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    limit: limitNum,
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

  // Handle both JSON and FormData
  let title, ingredients, instructions, category, cuisine, cookingTime, calories, isFeatured, image;

  if (req.is("multipart/form-data")) {
    // Handle FormData
    title = req.body.title;
    ingredients = JSON.parse(req.body.ingredients);
    instructions = req.body.instructions;
    category = req.body.category;
    cuisine = req.body.cuisine;
    cookingTime = req.body.cookingTime;
    calories = req.body.calories;
    isFeatured = req.body.isFeatured;
    image = req.body.image;
  } else {
    // Handle JSON
    ({ title, ingredients, instructions, category, cuisine, cookingTime, calories, isFeatured, image } = req.body);
  }

  if (!title || !ingredients || !instructions || !category || !cuisine) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) return next(new ErrorHandler("Recipe not found", 404));

  // Validate Cloudinary URL if provided
  let imageUrl = recipe.image; // Keep existing image by default
  if (image) {
    // Basic Cloudinary URL validation
    if (!image.startsWith("https://res.cloudinary.com/")) {
      return next(new ErrorHandler("Invalid Cloudinary image URL", 400));
    }
    imageUrl = image;
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

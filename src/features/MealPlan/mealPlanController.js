import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "../recipe/recipeModel.js";
import { MealPlan } from "./mealPlanModel.js";


//Add recipe to meal plan
export const addMealPlan = asyncHandler(async (req, res, next) => {
    const { recipe, date } = req.body;
  if (!recipe || !date) {
      return next(new ErrorHandler("Please provide recipe and date", 400));
    }
    const user = req.user._id;
    if(!user) return next(new ErrorHandler("Please login to add a recipe to your meal plan", 401));

  // Check if recipe exists
  const recipeExists = await Recipe.findById(recipe);
  if (!recipeExists) return next(new ErrorHandler("Recipe not found", 404));
  const mealPlan = await MealPlan.create({ user, recipe, date });

  res.status(201).json({
    success: true,
    message: "Recipe added to meal plan",
    mealPlan,
  });
});

// Get all meal plans for logged in user
export const getUserMealPlans = asyncHandler(async (req, res, next) => {
  const user = req.user._id;
  const mealPlans = await MealPlan.find({ user })
    .populate("recipe", "title image category cuisine")
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    mealPlans,
  });
});

// Update status
export const updateMealPlanStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !["planned", "cooking", "cooked"].includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }
  const mealPlan = await MealPlan.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!mealPlan) return next(new ErrorHandler("Meal plan not found", 404));

  res.status(200).json({
    success: true,
    message: "Meal plan status updated",
    mealPlan,
  });
});

// Delete recipe from meal plan
export const deleteMealPlan = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if(!id)
      return next(new ErrorHandler("Please provide a meal plan id", 400));
  const mealPlan = await MealPlan.findByIdAndDelete(id);
  if (!mealPlan) return next(new ErrorHandler("Meal plan not found", 404));

  res.status(200).json({
    success: true,
    message: "Meal plan deleted successfully",
  });
});

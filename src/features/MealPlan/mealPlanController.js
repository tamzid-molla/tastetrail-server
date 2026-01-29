import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { Recipe } from "../recipe/recipeModel.js";
import { MealPlan } from "./mealPlanModel.js";
import { User } from "../user/userModel.js";

//Add recipe to meal plan
export const addMealPlan = asyncHandler(async (req, res, next) => {
  const { recipe, date } = req.body;
  if (!recipe || !date) {
    return next(new ErrorHandler("Please provide recipe and date", 400));
  }
  const user = req.user._id;
  if (!user) return next(new ErrorHandler("Please login to add a recipe to your meal plan", 401));

  // Check if recipe exists
  const recipeExists = await Recipe.findById(recipe);
  if (!recipeExists) return next(new ErrorHandler("Recipe not found", 404));

  try {
    const mealPlan = await MealPlan.create({ user, recipe, date });

    // Update user cooking stats (planned)
    await User.findByIdAndUpdate(user, { $inc: { "cookingStats.totalMealsPlanned": 1 } });

    res.status(201).json({
      success: true,
      message: "Recipe added to meal plan",
      mealPlan,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new ErrorHandler(
          "This recipe is already added to your meal plan for the selected date. Please choose a different date or recipe.",
          400
        )
      );
    }
    return next(error);
  }
});

// Get all meal plans for logged in user
export const getUserMealPlans = asyncHandler(async (req, res, next) => {
  const user = req.user._id;
  const mealPlans = await MealPlan.find({ user })
    .populate({
      path: "recipe",
      select: "title image cookingTime calories category cuisine",
      populate: [
        { path: "category", select: "name _id" },
        { path: "cuisine", select: "name _id" },
      ],
    })
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
  // Ensure user can only update their own meal plan items
  const mealPlan = await MealPlan.findOne({ _id: id, user: req.user._id });
  if (!mealPlan) return next(new ErrorHandler("Meal plan not found", 404));

  const prevStatus = mealPlan.status;
  if (prevStatus !== status) {
    mealPlan.status = status;
    await mealPlan.save();

    const userId = req.user._id;
    if (prevStatus !== "cooked" && status === "cooked") {
      await User.findByIdAndUpdate(userId, {
        $inc: { "cookingStats.totalMealsCooked": 1 },
        $set: { "cookingStats.lastCookedRecipe": mealPlan.recipe },
      });
    } else if (prevStatus === "cooked" && status !== "cooked") {
      // prevent negative values
      const userDoc = await User.findById(userId).select("cookingStats.totalMealsCooked");
      const current = userDoc?.cookingStats?.totalMealsCooked || 0;
      if (current > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: { "cookingStats.totalMealsCooked": -1 },
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    message: "Meal plan status updated",
    mealPlan,
  });
});

// Delete recipe from meal plan
export const deleteMealPlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a meal plan id", 400));
  const mealPlan = await MealPlan.findOne({ _id: id, user: req.user._id });
  if (!mealPlan) return next(new ErrorHandler("Meal plan not found", 404));

  await MealPlan.deleteOne({ _id: id });

  // Update user cooking stats
  const userDoc = await User.findById(req.user._id).select(
    "cookingStats.totalMealsPlanned cookingStats.totalMealsCooked"
  );
  const plannedNow = userDoc?.cookingStats?.totalMealsPlanned || 0;
  const cookedNow = userDoc?.cookingStats?.totalMealsCooked || 0;

  const nextPlanned = Math.max(plannedNow - 1, 0);
  const nextCooked = mealPlan.status === "cooked" ? Math.max(cookedNow - 1, 0) : cookedNow;

  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      "cookingStats.totalMealsPlanned": nextPlanned,
      "cookingStats.totalMealsCooked": nextCooked,
    },
  });

  res.status(200).json({
    success: true,
    message: "Meal plan deleted successfully",
  });
});

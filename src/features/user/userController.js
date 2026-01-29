import cloudinary from "../../config/cloudinary.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import generateToken from "../../utils/generateToken.js";
import { User } from "./userModel.js";
import { Recipe } from "../recipe/recipeModel.js";
import { MealPlan } from "../MealPlan/mealPlanModel.js";
import fs from "fs";
import mongoose from "mongoose";

export const registerUser = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));

  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  let imageUrl = "";
  if (req.file) {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "TasteTrailUsers",
      quality: "auto",
      fetch_format: "auto",
    });
    imageUrl = result.secure_url;
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });
  }

  //find user
  const isUserExists = await User.findOne({ email });
  if (isUserExists) return next(new ErrorHandler("User already exists", 400));
  //create user
  const newUser = await User.create({ fullName, email, password, profilePhoto: imageUrl || "" });
  if (!newUser) return next(new ErrorHandler("Something went wrong Please try again later", 500));
  res.status(201).json({
    success: true,
    message: "User created successfully",
  });
});

//login user
export const loginUser = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorHandler("Please provide all required information", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 400));
  //compare password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) return next(new ErrorHandler("Invalid email or password", 400));
  user.password = undefined;
  generateToken(user, 200, "Login successful", res);
});

//get current user
export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.status(200).json({
    success: true,
    user,
  });
});

//get user count
export const getUserCount = asyncHandler(async (req, res, next) => {
  const count = await User.countDocuments();

  // Users registered between last Friday and this Friday (inclusive)
  const now = new Date();
  const end = new Date(now);
  const day = end.getDay(); // 0 = Sun, 5 = Fri
  const diffToFriday = (5 - day + 7) % 7;
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + diffToFriday);

  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const weeklyCount = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({
    success: true,
    count,
    weeklyCount,
  });
});

//logout user
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  let query = {};

  // If search query exists, search across multiple fields
  if (q) {
    query = {
      $or: [{ fullName: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }],
    };
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    users,
  });
});

// Update user role
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return next(new ErrorHandler("Role is required", 400));

  // Validate role
  if (!["user", "admin"].includes(role)) {
    return next(new ErrorHandler("Invalid role. Role must be 'user' or 'admin'", 400));
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
});

// Suspend user
export const suspendUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { isSuspended: true }, { new: true }).select("-password");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: "User suspended successfully",
    user,
  });
});

// Activate user
export const activateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { isSuspended: false }, { new: true }).select("-password");

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    message: "User activated successfully",
    user,
  });
});

export const getSavedRecipes = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  console.log(userId);
  const user = await User.findById(userId).populate({
    path: "savedRecipes",
    match: { status: "active" },
    populate: [
      { path: "category", select: "name _id" },
      { path: "cuisine", select: "name _id" },
      { path: "createdBy", select: "fullName email _id" },
    ],
  });
  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    recipes: user.savedRecipes || [],
  });
});

// Get user cooking statistics
export const getUserCookingStats = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const user = await User.findById(userId).select("cookingStats");
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Get recent cooked meals
  const recentCookedMeals = await MealPlan.find({
    user: userId,
    status: "cooked",
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate({
      path: "recipe",
      select: "title image cookingTime calories",
      populate: [
        { path: "category", select: "name" },
        { path: "cuisine", select: "name" },
      ],
    });

  res.status(200).json({
    success: true,
    stats: {
      totalMealsPlanned: user.cookingStats?.totalMealsPlanned || 0,
      totalMealsCooked: user.cookingStats?.totalMealsCooked || 0,
      recentCookedMeals: recentCookedMeals || [],
    },
  });
});

// Set or update user cooking goal
export const setUserCookingGoal = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { year, targetMeals } = req.body;
  console.log(year, targetMeals);

  if (!year || !targetMeals) {
    throw new ErrorHandler("Year and target meals are required", 400);
  }

  if (targetMeals <= 0) {
    throw new ErrorHandler("Target meals must be greater than 0", 400);
  }

  // Check if current goal already exists for this year
  const currentUser = await User.findById(userId).select("currentGoal");
  console.log("Current user goals:", currentUser?.currentGoal);
  console.log("Checking year:", year, "Current value:", currentUser?.currentGoal?.year);
  if (currentUser?.currentGoal?.year === year) {
    console.log("Goal already exists for this year, throwing error");
    throw new ErrorHandler(`Goal for ${year} already set. You cannot change it until next year.`, 400);
  }
  
  // Calculate expiry date (end of current year)
  const expiryDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st of the given year
  console.log("Setting goal for year:", year, "with expiry:", expiryDate);
  
  // Set the current goal and add to cookingGoals map
  const update = {};
  update[`cookingGoals.${year}`] = targetMeals;
  update.currentGoal = {
    targetMeals,
    year,
    expiryDate,
    createdAt: new Date()
  };
  
  const result = await User.updateOne(
    { _id: userId },
    { $set: update }
  );
  
  console.log("Update result:", result);
  
  if (result.matchedCount === 0) {
    throw new ErrorHandler("User not found", 404);
  }
  res.status(200).json({
    success: true,
    message: `Cooking goal set to ${targetMeals} meals for ${year}`,
    goal: { year, targetMeals },
  });
});

// Get user goals (current and history)
export const getUserGoals = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  
  const user = await User.findById(userId).select("currentGoal goalHistory");
  if (!user) return next(new ErrorHandler("User not found", 404));
  
  // Check if current goal has expired
  const now = new Date();
  console.log("Current date:", now);
  console.log("User current goal:", user.currentGoal);
  let currentGoal = user.currentGoal;
  
  if (currentGoal && currentGoal.expiryDate && now > currentGoal.expiryDate) {
    console.log("Goal has expired, setting to null");
    // Goal has expired, return null for current goal
    currentGoal = null;
  } else {
    console.log("Goal is still valid or doesn't exist");
  }
  
  res.status(200).json({
    success: true,
    currentGoal,
    goalHistory: user.goalHistory || []
  });
});

// Get user cooking analytics
export const getUserCookingAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { year } = req.query;

  const targetYear = year || new Date().getFullYear();

  // Get user to check if exists
  const user = await User.findById(userId);
  if (!user) return next(new ErrorHandler("User not found", 404));
  
  // Check if current goal has expired and move to history if needed
  const now = new Date();
  if (user.currentGoal && user.currentGoal.expiryDate && now > user.currentGoal.expiryDate) {
    // Move current goal to history
    const completedGoal = {
      targetMeals: user.currentGoal.targetMeals,
      year: user.currentGoal.year,
      achievedMeals: totalMeals || 0,
      completionPercentage: user.currentGoal.targetMeals > 0 ? 
        Math.min(Math.round((totalMeals / user.currentGoal.targetMeals) * 100), 100) : 0,
      createdAt: user.currentGoal.createdAt,
      completedAt: now
    };
    
    // Update user: add to history and clear current goal
    await User.updateOne(
      { _id: userId },
      { 
        $push: { goalHistory: completedGoal },
        $unset: { currentGoal: 1 }
      }
    );
    
    // Refresh user data
    const refreshedUser = await User.findById(userId);
    if (refreshedUser) {
      user.currentGoal = refreshedUser.currentGoal;
      user.goalHistory = refreshedUser.goalHistory;
    }
  }

  // Get cooked meals for the specified year
  const startDate = new Date(targetYear, 0, 1); // Jan 1st
  const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999); // Dec 31st

  const cookedMeals = await MealPlan.find({
    user: userId,
    status: "cooked",
    updatedAt: { $gte: startDate, $lte: endDate },
  }).populate({
    path: "recipe",
    select: "cuisine category title",
    populate: [
      { path: "cuisine", select: "name" },
      { path: "category", select: "name" },
    ],
  });

  // Calculate monthly breakdown
  const monthlyData = {};
  const cuisineCount = {};
  const categoryCount = {};

  // Initialize months
  for (let i = 0; i < 12; i++) {
    monthlyData[i] = 0;
  }

  cookedMeals.forEach((meal) => {
    const month = new Date(meal.updatedAt).getMonth();
    monthlyData[month]++;

    // Count cuisines
    if (meal.recipe?.cuisine?.name) {
      const cuisine = meal.recipe.cuisine.name;
      cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
    }

    // Count categories
    if (meal.recipe?.category?.name) {
      const category = meal.recipe.category.name;
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  });

  // Calculate streak (consecutive days with cooked meals)
  const datesWithMeals = [...new Set(cookedMeals.map((meal) => new Date(meal.updatedAt).toDateString()))].sort();

  let currentStreak = 0;
  let maxStreak = 0;

  if (datesWithMeals.length > 0) {
    let currentDate = new Date(datesWithMeals[0]);

    for (let i = 0; i < datesWithMeals.length; i++) {
      const mealDate = new Date(datesWithMeals[i]);

      // Check if consecutive
      if (mealDate.toDateString() === currentDate.toDateString()) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        // Reset streak if gap > 1 day
        const diffTime = Math.abs(mealDate - currentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          currentStreak = 1;
        } else {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        }
      }

      currentDate = mealDate;
    }
  }

  // Format monthly data for chart
  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month: new Date(targetYear, parseInt(month)).toLocaleString("default", { month: "short" }),
    meals: count,
  }));

  // Format cuisine data
  const cuisineData = Object.entries(cuisineCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 cuisines

  // Format category data
  const categoryData = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 categories

  const totalMeals = cookedMeals.length;
  const goal = user.cookingGoals?.[targetYear] || 0;
  const progressPercentage = goal > 0 ? Math.min(Math.round((totalMeals / goal) * 100), 100) : 0;

  res.status(200).json({
    success: true,
    analytics: {
      year: targetYear,
      totalMeals,
      goal,
      progressPercentage,
      streak: {
        current: currentStreak,
        max: maxStreak,
      },
      monthlyBreakdown: monthlyChartData,
      topCuisines: cuisineData,
      topCategories: categoryData,
    },
  });
});

// Get user nutrition summary
export const getUserNutritionSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  // Get cooked meals from last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentMeals = await MealPlan.find({
    user: userId,
    status: "cooked",
    updatedAt: { $gte: oneWeekAgo },
  }).populate({
    path: "recipe",
    select: "title calories cookingTime",
  });

  // Calculate weekly totals
  let totalCalories = 0;
  let totalMeals = recentMeals.length;

  recentMeals.forEach((meal) => {
    if (meal.recipe?.calories) {
      totalCalories += meal.recipe.calories;
    }
  });

  // Calculate averages
  const avgCaloriesPerMeal = totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0;

  // Estimate macro nutrients (basic estimation)
  // Protein: ~20% of calories, Carbs: ~50%, Fat: ~30%
  const proteinGrams = Math.round((totalCalories * 0.2) / 4); // 4 cal per gram
  const carbGrams = Math.round((totalCalories * 0.5) / 4); // 4 cal per gram
  const fatGrams = Math.round((totalCalories * 0.3) / 9); // 9 cal per gram

  // Get daily trend data
  const dailyData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startDate = new Date(date.setHours(0, 0, 0, 0));
    const endDate = new Date(date.setHours(23, 59, 59, 999));

    const dayMeals = recentMeals.filter((meal) => meal.updatedAt >= startDate && meal.updatedAt <= endDate);

    let dayCalories = 0;
    dayMeals.forEach((meal) => {
      if (meal.recipe?.calories) {
        dayCalories += meal.recipe.calories;
      }
    });

    dailyData.push({
      date: startDate.toISOString().split("T")[0],
      calories: dayCalories,
      meals: dayMeals.length,
    });
  }

  res.status(200).json({
    success: true,
    summary: {
      weeklyCalories: totalCalories,
      weeklyMeals: totalMeals,
      averageCaloriesPerMeal: avgCaloriesPerMeal,
      macroNutrients: {
        protein: proteinGrams,
        carbohydrates: carbGrams,
        fat: fatGrams,
      },
      dailyTrend: dailyData,
    },
  });
});

// Toggle save/unsave recipe
export const toggleSavedRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user._id;

  if (!recipeId) throw new ErrorHandler("Recipe id is required", 400);
  if (!mongoose.Types.ObjectId.isValid(recipeId)) throw new ErrorHandler("Invalid recipe id", 400);

  const recipeExists = await Recipe.findById(recipeId);
  if (!recipeExists) throw new ErrorHandler("Recipe not found", 404);

  // Check if already saved
  const user = await User.findById(userId).select("savedRecipes");
  const recipeObjectId = new mongoose.Types.ObjectId(recipeId);
  const alreadySaved = user.savedRecipes.some((id) => id.equals(recipeObjectId));

  if (alreadySaved) {
    // Remove recipe
    await User.updateOne({ _id: userId }, { $pull: { savedRecipes: recipeObjectId } });
  } else {
    // Add recipe
    await User.updateOne({ _id: userId }, { $addToSet: { savedRecipes: recipeObjectId } });
  }

  res.status(200).json({
    success: true,
    message: alreadySaved ? "Recipe removed from cookbook" : "Recipe saved to cookbook",
    saved: !alreadySaved,
  });
});

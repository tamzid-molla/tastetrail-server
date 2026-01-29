import { MealPlan } from "../features/MealPlan/mealPlanModel.js";
import { Recipe } from "../features/recipe/recipeModel.js";

export const getRecommendedRecipes = async (userId, limit = 12) => {
  const cookedRecipes = await MealPlan.find({ user: userId, status: "cooked" }).populate({
    path: "recipe",
    populate: [
      { path: "category", select: "name _id" },
      { path: "cuisine", select: "name _id" },
    ],
  });
  // Initialize favorite cuisines and categories
  const cuisineCount = {};
  const categoryCount = {};

  cookedRecipes.forEach((mp) => {
    const recipe = mp.recipe;
    if (recipe) {
      const cuisineId = recipe.cuisine?._id || recipe.cuisine;
      const categoryId = recipe.category?._id || recipe.category;
      if (cuisineId) {
        cuisineCount[cuisineId] = (cuisineCount[cuisineId] || 0) + 1;
      }
      if (categoryId) {
        categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
      }
    }
  });

  //most cooked
  const favoriteCuisine = Object.entries(cuisineCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  let recommended = [];

  // If user has cooked recipes, fetch based on preferences
  if (favoriteCuisine || favoriteCategory) {
    const query = { status: "active" };
    const orConditions = [];

    if (favoriteCuisine) {
      orConditions.push({ cuisine: favoriteCuisine });
    }
    if (favoriteCategory) {
      orConditions.push({ category: favoriteCategory });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
      recommended = await Recipe.find(query)
        .limit(limit)
        .populate("category", "name")
        .populate("cuisine", "name")
        .populate("createdBy", "fullName");
    }
  }

  if (recommended.length < limit) {
    const more = await Recipe.find({ status: "active" })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit - recommended.length)
      .populate("category", "name")
      .populate("cuisine", "name")
      .populate("createdBy", "fullName");

    // Avoid duplicates
    const existingIds = new Set(recommended.map((r) => r._id.toString()));
    const uniqueMore = more.filter((r) => !existingIds.has(r._id.toString()));
    return [...recommended, ...uniqueMore];
  }

  return recommended;
};

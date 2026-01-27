import { MealPlan } from "../features/MealPlan/mealPlanModel.js";
import { Recipe } from "../features/recipe/recipeModel.js";

export const getRecommendedRecipes = async (userId, limit = 12) => {
  const cookedRecipes = await MealPlan.find({ user: userId, status: "cooked" }).populate("recipe");
  // Initialize favorite cuisines and categories
  const cuisineCount = {};
  const categoryCount = {};

  cookedRecipes.forEach(mp => {
    const recipe = mp.recipe;
    if (recipe) {
      cuisineCount[recipe.cuisine] = (cuisineCount[recipe.cuisine] || 0) + 1;
      categoryCount[recipe.category] = (categoryCount[recipe.category] || 0) + 1;
    }
  });
  //most cooked
  const favoriteCuisine = Object.entries(cuisineCount).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const favoriteCategory = Object.entries(categoryCount).sort((a,b)=>b[1]-a[1])[0]?.[0];

  // Fetch recommended recipes
  const recommended = await Recipe.find({
    status: "active",
    $or: [
      { cuisine: favoriteCuisine },
      { category: favoriteCategory }
    ]
  })
  .limit(limit)
  .populate("category", "name")
  .populate("cuisine", "name")
  .populate("createdBy", "fullName");

  // if data is less than limit, fetch more random top-rated recipes
  if (recommended.length < limit) {
    const more = await Recipe.find({ status: "active" })
      .sort({ averageRating: -1 })
      .limit(limit - recommended.length)
      .populate("category", "name")
      .populate("cuisine", "name")
      .populate("createdBy", "fullName");

    return [...recommended, ...more];
  }

  return recommended;
};

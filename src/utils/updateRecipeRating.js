import { Recipe } from "../features/recipe/recipeModel.js";
import { Review } from "../features/review/reviewModel.js";


export const updateRecipeRating = async (recipeId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        recipe: recipeId,
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$recipe",
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Recipe.findByIdAndUpdate(recipeId, {
      totalReviews: stats[0].totalReviews,
      averageRating: Number(stats[0].averageRating.toFixed(1)),
    });
  } else {
    await Recipe.findByIdAndUpdate(recipeId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

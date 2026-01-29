import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { capitalizeFirstLetter } from "../../utils/formatText.js";
import { Recipe } from "../recipe/recipeModel.js";
import { Category } from "./categoryModel.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide a name for the category", 400));
  const { name, description } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a name for the category", 400));
  //format name
  const formattedName = capitalizeFirstLetter(name);

  const isExists = await Category.findOne({ name: { $regex: `^${formattedName}$`, $options: "i" } });
  if (isExists) return next(new ErrorHandler("Category already exists", 400));
  const categoryData = { name: formattedName };
  if (description) {
    categoryData.description = description;
  }
  const category = await Category.create(categoryData);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// Get category count
export const getCategoryCount = asyncHandler(async (req, res, next) => {
  const count = await Category.countDocuments();

  // Categories created between last Friday and this Friday (inclusive)
  const now = new Date();
  const end = new Date(now);
  const day = end.getDay(); // 0 = Sun, 5 = Fri
  const diffToFriday = (5 - day + 7) % 7;
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + diffToFriday);

  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const weeklyCount = await Category.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  res.status(200).json({
    success: true,
    count,
    weeklyCount,
  });
});

// Get all categories
export const allCategory = asyncHandler(async (req, res, next) => {
  // Get search query from request params
  const { q } = req.query;

  let query = {};

  // If search query exists, search in name and description fields
  if (q) {
    query = {
      $or: [
        { name: { $regex: q, $options: "i" } }, // Case insensitive search in name
        { description: { $regex: q, $options: "i" } }, // Case insensitive search in description
      ],
    };
  }

  const categories = await Category.find(query);

  // Add recipe count for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const recipeCount = await Recipe.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        recipeCount,
      };
    }),
  );

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    categories: categoriesWithCounts,
  });
});

//Get single category
export const singleCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a category id", 400));
  const category = await Category.findById(id);
  if (!category) return next(new ErrorHandler("Category not found", 404));
  res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    category,
  });
});

//update category
export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a new category name", 400));
  if (!id) return next(new ErrorHandler("Please provide a category id", 400));
  //format name
  const formattedName = capitalizeFirstLetter(name);
  //is exists
  const isExists = await Category.findOne({ name: { $regex: `^${formattedName}$`, $options: "i" } });
  if (isExists) return next(new ErrorHandler("Category already exists", 400));
  const updateData = { name: formattedName };
  if (description !== undefined) {
    updateData.description = description;
  }
  const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!category) return next(new ErrorHandler("Category not found", 404));
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

//delete category
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide a category id", 400));

  //check recipe exists in this category
  const recipeCount = await Recipe.countDocuments({ category: id });
  if (recipeCount > 0)
    return next(new ErrorHandler("Cannot delete this category because it is associated with existing recipes", 400));

  const category = await Category.findByIdAndDelete(id);
  if (!category) return next(new ErrorHandler("cannot delete category, please try again", 404));
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

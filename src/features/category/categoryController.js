import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import { capitalizeFirstLetter } from "../../utils/formatText.js";
import { Recipe } from "../recipe/recipeModel.js";
import { Category } from "./categoryModel.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.body) return next(new ErrorHandler("Please provide a name for the category", 400));
  const { name } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a name for the category", 400));
  //format name
  const formattedName = capitalizeFirstLetter(name);

  const isExists = await Category.findOne({ name: { $regex: `^${formattedName}$`, $options: 'i' } });
  if (isExists) return next(new ErrorHandler("Category already exists", 400));
  const category = await Category.create({ name: formattedName });
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// Get all categories
export const allCategory = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    categories,
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
  const { name } = req.body;
  if (!name) return next(new ErrorHandler("Please provide a new category name", 400));
  if (!id) return next(new ErrorHandler("Please provide a category id", 400));
  //format name
  const formattedName = capitalizeFirstLetter(name);
  //is exists
  const isExists = await Category.findOne({ name: { $regex: `^${formattedName}$`, $options: 'i' } });
  if (isExists) return next(new ErrorHandler("Category already exists", 400));
  const category = await Category.findByIdAndUpdate(id, { name: formattedName }, { new: true, runValidators: true });
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

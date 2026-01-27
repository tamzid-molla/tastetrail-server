import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  cuisine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cuisine",
    required: true,
  },
  averageRating: {
  type: Number,
  default: 0,
},

totalReviews: {
  type: Number,
  default: 0,
},
  cookingTime: { type: Number }, 
  calories: { type: Number }, 
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, default: "active", enum: ["active", "inactive"] },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export const Recipe = mongoose.model("Recipe", recipeSchema);
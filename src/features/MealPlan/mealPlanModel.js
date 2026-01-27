import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["planned", "cooking", "cooked"],
    default: "planned",
  },
}, { timestamps: true });

//prevent same recipe for same user and same date
mealPlanSchema.index({ user: 1, recipe: 1, date: 1 }, { unique: true });

export const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

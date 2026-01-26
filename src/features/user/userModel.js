import mongoose from "mongoose";
import config from "../../config/config";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [50, "Full name cannot exceed 50 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        profilePhoto: {
            type: String,
            default: "",
        },

        preferences: {
            favoriteCuisines: [{ type: String }],
            favoriteCategories: [{ type: String }],
            dietaryRestrictions: [{ type: String }],
        },

        cookingStats: {
            totalMealsPlanned: { type: Number, default: 0 },
            totalMealsCooked: { type: Number, default: 0 },
            lastCookedRecipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
        },

        savedRecipes: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
        ],

        weeklyMealPlan: [
            {
                recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
                day: { type: String },
                status: { type: String, enum: ["Planned", "Cooking", "Cooked"], default: "Planned" },
            }
        ],
    },
    { timestamps: true }
);

userSchema.methods.generateToken = function () {
    return jwt.sign({ _id: this._id }, config.JWT_SECRET, { expiresIn: "7d" });
};

export const User = mongoose.model("User", userSchema);
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, "Name must be at least 3 characters long"],
        trim: true
    },
},{timestamps: true})

export const Category = mongoose.model("Category", categorySchema);

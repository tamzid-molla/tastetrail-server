import cloudinary from "../../config/cloudinary.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import generateToken from "../../utils/generateToken.js";
import { User } from "./userModel.js";
import fs from "fs";

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
  res.status(200).json({
    success: true,
    count,
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

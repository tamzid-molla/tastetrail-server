import {asyncHandler} from "../../middleware/asyncHandler.js";
import ErrorHandler from "../../middleware/errorHandler.js";
import generateToken from "../../utils/generateToken.js";
import {User} from "./userModel.js";

export const registerUser = asyncHandler(async (req, res, next) => {
     if (!req.body) return next(new ErrorHandler("Please provide all required information", 400));

    const { fullName, email, password, profilePhoto } = req.body;
  if (!fullName || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }
  //find user
  const isUserExists = await User.findOne({ email });
  if (isUserExists) return next(new ErrorHandler("User already exists", 400));
  //create user
    const newUser = await User.create({ fullName, email, password, profilePhoto: profilePhoto || "" });
    if(!newUser) return next(new ErrorHandler("Something went wrong Please try again later", 500));
  generateToken(newUser, 201, "User created successfully", res);
});

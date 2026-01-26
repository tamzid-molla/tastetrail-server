import { User } from "../features/user/userModel.js";
import { asyncHandler } from "./asyncHandler.js";
import jwt from "jsonwebtoken";

const isAuthenticated = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return next(new ErrorHandler("Please login to access this resource", 401));
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return next(new ErrorHandler("Please login to access this resource", 401));
    //find user 
    req.user = await User.findById(decoded?._id);
    if (!req.user) return next(new ErrorHandler("User not found", 404));
    next();
})

export default isAuthenticated;

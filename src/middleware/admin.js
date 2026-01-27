import { asyncHandler } from "./asyncHandler";

const adminOnly = asyncHandler(async (req, res, next) => { 
    const user = req.user;
    if (!user) return next(new ErrorHandler("Unauthorized", 401));
    if (user.role !== "admin") return next(new ErrorHandler("access denied", 403));
    next();
});
export default adminOnly;

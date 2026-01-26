import config from "../config/config";

const generateToken = (user, statusCode, message, res) => {
    const token = user?.generateToken();

    res.statusCode(statusCode).cookie("token", token, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).json({
        success: true,
        message,
        user,
    })
};
export default generateToken;

import config from "../config/config.js";

const generateToken = async (user, statusCode, message, res) => {
  const token = await user.generateToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message,
      user,
    });
};

export default generateToken;

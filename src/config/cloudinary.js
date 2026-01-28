import cloudinary from "cloudinary";
import dotenv from 'dotenv';
import config from "./config.js";
dotenv.config();

cloudinary.v2.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.CLOUD_API_KEY,
  api_secret:config.CLOUD_API_SECRET 
});

export default cloudinary
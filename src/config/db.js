import mongoose from 'mongoose';
import config from './config.js';

const connectDb = async () => {
    const uri = config.MONGO_URI;
    if (!uri) console.log("Mongo URI is not defined");
   try {
       await mongoose.connect(uri, { connectTimeoutMS: 5000 });
       console.log("Database connected successfully");
   } catch (error) {
       console.log("Database connection error:", error);
       process.exit(1);
   }
}

export default connectDb;
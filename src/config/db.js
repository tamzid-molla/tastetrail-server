import mongoose from 'mongoose';
import config from './config.js';

const connectDb = async () => {
    const uri = config.MONGO_URI || "mongodb+srv://assignment-11:zMRv0A5j4FOr6bIW@cluster0.cykplbd.mongodb.net/tastetrail?retryWrites=true&w=majority&appName=Cluster0";
    if (!uri) console.log("Mongo URI is not defined");
   try {
       await mongoose.connect(uri,);
       console.log("Database connected successfully");
   } catch (error) {
       console.log("Database connection error:", error);
       process.exit(1);
   }
}

export default connectDb;
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({});

const connectDb=async()=>{
    try{
        await mongoose.connect(process.env.DB_URI);
        console.log("MongoDb connected successfully");
    }catch(e){
        console.log(e);
    }
};
export default connectDb;
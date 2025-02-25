import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    caption:{type:String,default:""},
    image:{type:String,require:true},
    author:{type:mongoose.Schema.ObjectId,ref:'User'},
    likes:[{type:mongoose.Schema.ObjectId,ref:'User'}],
    comments:[{type:mongoose.Schema.ObjectId,ref:'User'}],
});
export const Post=mongoose.model('Post',postSchema);
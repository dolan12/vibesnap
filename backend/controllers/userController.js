import { User } from "../models/userModel.js";
import getDataUri from "../utils/dataUri.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Post } from "../models/postModel.js";
dotenv.config({});
import cloudinary from "../utils/cloudinary.js";

export const register=async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        if(!username||!email||!password){
            return res.status(401).json({
                message:"Something is missing,please check",
                success:false,
            });
        };
        const user=await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:"email already exists,try log in",
                success:false,
            });
        };
        const hashPassword=await bcrypt.hash(password,10);
        await User.create({
            username,
            email,
            password:hashPassword
        });
        return res.status(201).json({
            message:"Account created succesfully",
            success:true,
        });

    }catch(e){
        console.log(e);
    };
};

export const login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(401).json({
                message:"Something is missing,Please check",
                success:false,
            });
        }
        let user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false,
            });
        }
        const isPasswordMatch=await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false,
            });
        };

        const token=await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1d'});
        const populatedPosts=await Promise.all(
            user.posts.map(async (postId)=>{
                const post=await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        );
        //this user object for showing in frontend purpose
        user={ 
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:populatedPosts,

        };
       
        return res.cookie('token',token,{ httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
            message:`Welcome back ${user.username}`,
            success:true,
            user
        });
    } catch (error) {
        console.log(error);
    }
};

export const logout=async(req,res)=>{
    try {
        return res.cookie("token","",{maxage:0}).json({
            message:"Logged out succesfully",
            success:true,
        });
    } catch (error) {
        console.log(error);
    }
};

export const getProfile=async(req,res)=>{
    try {
        const userId=req.params.id;
        let user=await User.findById(userId).select("-password");
        return res.status(200).json({
            user,
            success:true,
        });
    } catch (error) {
        console.log(error);
    };
};

export const editProfile=async (req,res)=>{
    try {
        const userId=req.id;
        const {bio,gender}=req.body;
        const profilePicture=req.file;
        
        let cloudResponse;
        if(profilePicture){
            const fileUri=getDataUri(profilePicture);
            cloudResponse=await cloudinary.uploader.upload(fileUri);
        }
        const user=await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json({
                message:"User not found!",
                success:false,
            });
        }
        if(bio)user.bio=bio;
        if(gender)user.gender=gender;
        if(profilePicture) user.profilePicture=cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message:"profile updated",
            success:true,
            user
        });
    } catch (error) {
        console.log(error);
    }
};

export const getSuggestedUser= async (req,res)=>{
    try{
        const suggestedUser=await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUser){
            return res.status(404).json({
                message:"No suggested user found!",
                success:false,
            });
            
        }
        return res.status(200).json({
            success:true,
            users:suggestedUser
        });
    }catch(err){
        console.log(err);
    }
};

export const followOrUnfollow=async(req,res)=>{
    try {
        const follower=req.id;//who is following
        const followed=req.params.id;//who is being followed
        if(follower===followed){
            return res.status(404).json({
                message:"You cannot follow yourself",
                success:false
            });
        }
        const user=await User.findById(follower);
        const followedUser=await User.findById(followed);
        if(!user || !followedUser){
            return res.status(404).json({
                message:"User not found!",
                success:true
            });
        }
        
        const isFollowing=user.following.includes(followed);
        if(isFollowing){
            //unfollow logic
            await Promise.all([
                User.updateOne({_id:follower},{$pull:{following:followed}}),
                User.updateOne({_id:followed},{$pull:{followers:follower}}),
            ]);
            return res.status(200).json({
                message:"Unfollowed succesfully",
                success:true
            });
        }else{
            //follow logic
            await Promise.all([
                User.updateOne({_id:follower},{$push:{following:followed}}),
                User.updateOne({_id:followed},{$push:{followers:follower}}),
            ]);
            return res.status(200).json({
                message:"Followed succesfully",
                success:true
            });
        }
    } catch (error) {
        console.log(error);
        
    }
};
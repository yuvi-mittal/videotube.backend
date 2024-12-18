import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true,  // searcing field enhance
            isActive: Boolean
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {    
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps:true
    }
    )

    userSchema.pre("save", async function (next) {  //pre is hook, data "save " se pehle.... next (ye flag aage pass kardo)
        if(!this.isModified("password")) return next();  // should run only when passwordis modified 
    
        this.password = await bcrypt.hash(this.password, 10) //password encryption
        next()
    })

    //checks password with the one in database , this is a custom method
    userSchema.methods.isPasswordCorrect = async function(password){
        return await bcrypt.compare(password, this.password)
    }
//Generates a JWT access token containing the user's basic info (_id, email, username, fullName). sth we trust
    userSchema.methods.generateAccessToken = function(){
        return jwt.sign(   //sign is a method
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }
    
    userSchema.methods.generateRefreshToken = function(){
        return jwt.sign(
            {
                _id: this._id,
                
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }

export const User = mongoose.model('User' , userSchema)

import { mongoose, Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                location: String
            },
            default: {
                url: `https://placehold.co/600x400`,
                location: ''
            }
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowarcase: true,
            trim: true,
            index: true

        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: [true, "password is required"],
            unique: true,
            trim: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("passward")) return next

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswaordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.genereateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.methods.genereateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genereateTemporaryToken = function(){
    const unHashedToken = crypto.randomBytes(20).toString("hex")
    
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex")
    
    const tokenExpiry = Date.now() + (20*60*1000) // 20min
    return {unHashedToken,hashedToken,tokenExpiry}
}

export const User = mongoose.model("User", userSchema) 
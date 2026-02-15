import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError } from '../utils/api-error.js'
import { sendMail, emailVerificationMailgenContent } from '../utils/mail.js'

// const generateAcessAndRefreshTokens = async (userId) => {
//     try {
//         const user = await User.findById(userId)
//         const accessToken = User.genereateAccessToken()
//         const refreshToken = User.genereateRefreshToken()
//         user.refreshToken = refreshToken
//         user.accessToken = accessToken
//         await User.save({ validateBeforeSave: false })
//         return {
//             accessToken,
//             refreshToken
//         }

//     } catch (err) {
//         throw new ApiError(
//             500,
//             "something went wrong while genreating access token"
//         )
//     }
// }

const generateAcessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.genereateAccessToken();
    const refreshToken = user.genereateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("TOKEN ERROR:", err);
    throw new ApiError(500, "Something went wrong while generating access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { email, username, password, role } = req.body
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with this email or userName is already exists", [])
    }

    const user = await User.create({
        email,
        username,
        password,
        isEmailVerified: false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.genereateTemporaryToken()

    User.emailVerifivationToken = hashedToken
    User.emailVerificationExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendMail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/verify-email${unHashedToken}`
            )
        }

    )
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if (!createdUser) {
        throw new ApiError(
            500,
            "somethins went wrong while resistering the user"
        )
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "user register successfully and verification email has sent on your email"
            )
        )
})

const loginUser = asyncHandler(async (req , res) => {
    const {email , password } = req.body

    if(!email ){
        throw new ApiError(
            400,
            `username or email is require`
        )
    }
    const user = await User.findOne({email})
    if(!user) {
        throw new ApiError(
            400,
            `User does not exists`
        )
    }
    const isPasswordValid = await user.isPasswordCorrect(password) 
    if(!isPasswordValid){
        throw new ApiError(
            400,
            `Password is wrong, plese enter again`
        )
    }
    const {accessToken,refreshToken} =  await generateAcessAndRefreshTokens(user._id)

     const loginedUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnes : true,
        secure : true,
    }

    return res
        .status(200)
        .cookie("accessToken",accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(
                200,
                {
                    user:loginUser,
                    accessToken,
                    refreshToken,
                },
                `User logged in successfully`
            )
        )

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: ""
            }
        },
        {
            new : true 
        },
    );
    const options = {
        httpOnes:true,
        secure:true,
    }
    return res 
        .status(200)
        .clearCookie("refreshToken",options)
        .clearCookie("accessToken",options)
        .json( new ApiResponse(200,{},"User logged out"))
})

const getCurrentUser = asyncHandler(async (req , res ) => { 
    return res 
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "Current user featched successfully"
        ))
})

const verifyEmail = asyncHandler(async (req,res)=>{
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new ApiError(400,"Email verification token is missing")
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken : hashedToken,
        emailVerificationExpiry : {$gt:Date.now()}
    })

    if(!user){
        throw new ApiError(
            400,
            "Token is invalid or expiered"
        )
    }
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined

    user.isEmailVerified = true
    await user.save({validateBeforeSave:false})

    return res 
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    isEmailVerified:true
                },
                "Email is verified"
            )
        )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
}
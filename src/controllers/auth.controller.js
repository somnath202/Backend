import { User } from '../models/User.models.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'
import { ApiError } from '../utils/api-error.js'
import { sendMail, emailVerificationMailgenContent } from '../utils/mail.js'

const generateAcessAndRefreshTokens = async (userId) => {
    try {
        const user = User.findById(userId)
        const accessToken = User.genereateAccessToken()
        const refreshToken = User.genereateRefreshToken()
        user.refreshToken = refreshToken
        user.accessToken = accessToken
        await User.save({ validateBeforeSave: false })
        return {
            accessToken,
            refreshToken
        }

    } catch (err) {
        throw new ApiError(
            500,
            "something went wrong while genreating access token"
        )
    }
}

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

    user.emailVerifivationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

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

export { registerUser }
import {body} from 'express-validator'



const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username should in lower case")
            .isLength({min:5})
            .withMessage("Username is must be at lest 5 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({min:5})
            .withMessage("password is must be at lest 5 characters"),
        body("fullName")
            .optional()
            .trim()  
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
    ] 
} 

export {
    userRegisterValidator,
    userLoginValidator
}
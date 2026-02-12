import {Router} from 'express'
import {registerUser,loginUser,logoutUser} from '../controllers/auth.controller.js'
import {validate} from '../middlewares/validator.middlewares.js'
import {userRegisterValidator,userLoginValidator} from '../validators/index.validators.js'
import {verifyJWT} from '../middlewares/auth.middlewares.js'
const router = Router()

router.route("/register").post(userRegisterValidator() ,validate , registerUser)
router.route("/login").post(userLoginValidator() , validate, loginUser)
router.route("/logout").post(verifyJWT , logoutUser)

export default router 
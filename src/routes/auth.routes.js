import {Router} from 'express'
import {registerUser,loginUser} from '../controllers/auth.controller.js'
import {validate} from '../middlewares/validator.middlewares.js'
import {userRegisterValidator,userLoginValidator} from '../validators/index.validators.js'
const router = Router()

router.route("/register").post(userRegisterValidator() ,validate , registerUser)
router.route("/login").post(userLoginValidator() , validate, loginUser)

export default router 
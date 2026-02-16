import {Router} from 'express'
import {registerUser,loginUser,logoutUser} from '../controllers/auth.controller.js'
import {validate} from '../middlewares/validator.middlewares.js'
import {userRegisterValidator,userLoginValidator} from '../validators/index.validators.js'
import {verifyJWT} from '../middlewares/auth.middlewares.js'
import {getCurrentUser} from '../controllers/auth.controller.js'
const router = Router()

router.route("/register").post(userRegisterValidator() ,validate , registerUser)
router.route("/login").post(userLoginValidator() , validate, loginUser)

//secure routes
router.route("/logout").post(verifyJWT , logoutUser)
router.route("/getcurrentuser").post(getCurrentUser)

 
export default router 
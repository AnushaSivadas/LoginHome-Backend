const { Signup,Login, GoogleSignin, verifyEmail } = require("../Controllers/AuthController");
const {userVerification} = require("../Middlewares/AuthMiddleware")
const router = require("express").Router();

router.post("/signup", Signup);
router.get("/:id/verify/:token/",verifyEmail);
router.post("/login", Login);
router.post("/googleSignin", GoogleSignin);
// router.post('/',userVerification)


module.exports = router;
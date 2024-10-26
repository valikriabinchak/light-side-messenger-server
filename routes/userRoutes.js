const express = require( 'express' );
const userController = require( '../controllers/userController' );
const router = express.Router();

router.post( '/register', userController.registerUser );
router.post( '/login', userController.loginUser );
router.post( '/send-email', userController.sendUserresetPasswordEmail );
router.post( '/reset-password/:email', userController.resetUserPassword );

router.get( '/profile', userController.getUserProfile );
router.put( '/profile', userController.updateUserProfile );

module.exports = router;

const express = require( 'express' );
const messageController = require( '../controllers/messageController' );
const router = express.Router();

router.get( '/', messageController.getChatMessages );

module.exports = router;

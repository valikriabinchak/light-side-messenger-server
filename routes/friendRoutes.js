const express = require( 'express' );
const friendController = require( '../controllers/friendController' );
const router = express.Router();

router.get( '/', friendController.getUserFriends );
router.get( '/requests', friendController.getFriendRequests );

router.post( '/request', friendController.sendFriendRequest );
router.post( '/accept', friendController.acceptFriendRequest );
router.delete( '/reject', friendController.rejectFriendRequest );

module.exports = router;

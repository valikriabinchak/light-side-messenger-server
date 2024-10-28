const FriendRequests = require( '../models/mongo/FriendRequestModel' );
const FriendRelations = require( '../models/mongo/FriendRelationModel' );
const Users = require( '../models/mongo/UserModel' );
const Messages = require( '../models/mongo/MessageModel' );

const bcrypt = require( 'bcrypt' );
const { v4: uuidv4 } = require( 'uuid' );
const jwt = require( 'jsonwebtoken' );

exports.getUserFriends = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const currentUserEmail = decoded.email;

        const relations = await FriendRelations.find( {
            $or: [ { user1Email: currentUserEmail }, { user2Email: currentUserEmail } ]
        } );

        const friendEmails = relations.map( rel =>
            rel.user1Email === currentUserEmail ? rel.user2Email : rel.user1Email
        );

        const friends = await Users.find(
            { email: { $in: friendEmails } },
            'firstName secondName email lastSeen imagePath'
        ).lean();

        const friendsWithLastMessage = [];

        for ( const friend of friends ) {
            const message = await Messages.findOne( {
                $or: [
                    { sender: currentUserEmail, receiver: friend.email },
                    { sender: friend.email, receiver: currentUserEmail }
                ]
            } ).sort( { timestamp: -1 } );

            friendsWithLastMessage.push( {
                ...friend,
                lastMessage: message?.content || "No messages yet"
            } );
        }

        res.status( 200 ).json( friendsWithLastMessage );
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};

exports.getFriendRequests = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const currentUserEmail = decoded.email;

        const relations = await FriendRequests.find( { receiver: currentUserEmail } );

        const requestedPeople = await Promise.all( relations.map( async rel =>
            await Users.findOne( { email: rel.sender } )
        ) );

        res.status( 200 ).json( requestedPeople );
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};

exports.sendFriendRequest = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const senderEmail = decoded.email;
        const { friendEmail } = req.body;

        const friendExists = await Users.findOne( { email: friendEmail } );
        if ( !friendExists ) {
            return res.status( 400 ).json( { message: 'User not found' } );
        }

        const existingRequest = await FriendRequests.findOne( {
            sender: senderEmail,
            receiver: friendEmail,
        } );

        if ( existingRequest ) {
            return res.status( 400 ).json( { message: 'Friend request already sent' } );
        }

        const friendRequest = new FriendRequests( {
            sender: senderEmail,
            receiver: friendEmail,
        } );
        await friendRequest.save();

        res.status( 201 ).json( { message: 'Friend request sent successfully' } );
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};

exports.acceptFriendRequest = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const currentUserEmail = decoded.email;

        const { friendEmail } = req.body;

        const newRelation = new FriendRelations( {
            user1Email: currentUserEmail,
            user2Email: friendEmail,
        } );

        await newRelation.save();

        await FriendRequests.deleteOne( { sender: friendEmail, receiver: currentUserEmail } );

        res.status( 201 ).json( { message: 'Friend request accepted successfully' } );
    } catch ( err ) {
        console.error( 'Error accepting friend request:', err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};

exports.rejectFriendRequest = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const currentUserEmail = decoded.email;

        const { friendEmail } = req.body;

        const result = await FriendRequests.deleteOne( {
            sender: friendEmail,
            receiver: currentUserEmail,
        } );

        if ( result.deletedCount === 0 ) {
            return res.status( 404 ).json( { message: 'Friend request not found' } );
        }

        res.status( 200 ).json( { message: 'Friend request rejected successfully' } );
    } catch ( err ) {
        console.error( 'Error rejecting friend request:', err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};
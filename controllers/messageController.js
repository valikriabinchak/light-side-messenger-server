const Messages = require( '../models/mongo/MessageModel' );
const bcrypt = require( 'bcrypt' );
const { v4: uuidv4 } = require( 'uuid' );
const jwt = require( 'jsonwebtoken' );

exports.getChatMessages = async ( req, res ) => {
    try {
        const token = req.headers.authorization.split( ' ' )[ 1 ];
        const decoded = jwt.verify( token, 'lightsidemess123' );
        const currentUserEmail = decoded.email;

        const { friendEmail } = req.query;

        const messages = await Messages.find( {
            $or: [
                { sender: currentUserEmail, receiver: friendEmail },
                { sender: friendEmail, receiver: currentUserEmail }
            ]
        } ).sort( { timestamp: 1 } );

        res.status( 200 ).json( messages );
    } catch ( err ) {
        console.error( 'Error fetching messages:', err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};
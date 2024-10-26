const Users = require( '../models/mongo/UserModel' );
const saltRounds = 10
const bcrypt = require( 'bcrypt' );
const { v4: uuidv4 } = require( 'uuid' );
const jwt = require( 'jsonwebtoken' );

exports.registerUser = async ( req, res ) => {
    try {
        const { firstName, email, password } = req.body;
        const existingUser = await Users.findOne( { firstName, email } );
        if ( existingUser ) return res.status( 400 ).json( { message: 'User already exists' } );

        const salt = await bcrypt.genSalt( saltRounds );
        const hash = await bcrypt.hash( password, salt );
        const newUser = new Users( { firstName, email, password: hash } );
        await newUser.save();

        res.status( 201 ).json( { message: 'User registered successfully' } );
    }
    catch ( err ) {
        console.error( err );
    }
};

exports.loginUser = async ( req, res ) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne( { email } );
        if ( !user ) return res.status( 400 ).json( { message: 'Can not find the user' } );
        console.log( "password: ", password, user.password );

        const isValidPassword = await bcrypt.compare( password, user.password );
        if ( !isValidPassword ) return res.status( 400 ).json( { message: 'Invalid password' } );

        const token = jwt.sign( { email: user.email }, "lightsidemess123", { expiresIn: '48h' } );

        try {

            await Users.findByIdAndUpdate(
                user._id,
                { lastSeen: new Date() },
                { new: true }
            );

            console.log( `Updated lastSeen for user ${ user.email }` );
        } catch ( err ) {
            console.error( 'Error updating lastSeen on disconnect:', err );
        };

        res.status( 200 ).json( { token } );
    }
    catch ( err ) {
        console.error( err )
    }
};

exports.sendUserresetPasswordEmail = ( req, res ) => {
    console.log( "SEND LINK TO RESET PASSWORD TO EMAIL: " + req.body.email );

    res.status = 200;
    res.send( {
        message: "Link has been sent to the user email!",
        data: {
            email: req.body.email
        }
    } );
};

exports.resetUserPassword = ( req, res ) => {
    const body = JSON.parse( req.body );

    console.log( "RESET PASSWORD FOR USER WITH ID: " + req.params.email );
    console.log( "NEW PASSWORD WILL BE: " + body.newPassword );

    res.status = 200;
    res.send( { message: "Password was changed!" } );
};

exports.getUserProfile = async ( req, res ) => {
    const { email } = req.user;

    try {
        const user = await Users.findOne( { email } );
        if ( !user ) return res.status( 404 ).json( { message: 'User not found' } );

        res.status( 200 ).json( user );
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json( { message: 'Server error' } );
    }
};

exports.updateUserProfile = ( req, res ) => {
    const token = req.headers.authorization.split( ' ' )[ 1 ];
    const decoded = jwt.verify( token, 'lightsidemess123' );
    const userEmail = decoded.email;

    console.log( "DECODED TOKEN: ", decoded );
    Users.findByIdAndUpdate( userEmail, req.body, { new: true }, ( err, user ) => {
        if ( err ) return res.status( 500 ).send( err );
        res.status( 200 ).json( user );
    } );
};

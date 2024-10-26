const mongoose = require( 'mongoose' );
const dotenv = require( 'dotenv' );
const express = require( 'express' );
const http = require( 'http' );
const { Server } = require( 'socket.io' );
const cors = require( 'cors' );


const app = require( './app' );
const server = http.createServer( app );

const bodyParser = require( 'body-parser' );

const Users = require( './models/mongo/UserModel' );
const Messages = require( './models/mongo/MessageModel' );

dotenv.config( { path: './config.env' } );
app.use( bodyParser.json() );

mongoose
  .connect( process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  } )
  .then( ( con ) => {
    console.log( 'DB connection successful' );
  } );

const io = new Server( server, {
  cors: {
    origin: [ "http://localhost:3000", "http://localhost:8080" ], // Frontend URL
    methods: [ "GET", "POST" ],
    credentials: true
  }
} );

io.on( 'connection', ( socket ) => {
  console.log( 'A user connected:', socket.id );

  socket.on( 'registerEmail', async ( email ) => {
    try {
      const user = await Users.findOneAndUpdate(
        { email },
        { socketId: socket.id },
        { new: true }
      );

      if ( user ) {
        console.log( `User ${ email } associated with socket ${ socket.id }` );
      } else {
        console.warn( 'User not found for email:', email );
      }
    } catch ( err ) {
      console.error( 'Error registering email:', err );
    }
  } );

  socket.on( 'sendMessage', async ( message ) => {
    try {
      const newMessage = new Messages( message );
      await newMessage.save();

      io.emit( `newMessage:${ message.receiver }`, message );
      console.log( 'Message sent to:', message.receiver );
    } catch ( err ) {
      console.error( 'Error saving or sending message:', err );
    }
  } );

  socket.on( 'disconnect', async () => {
    console.log( 'A user disconnected:', socket.id );

    try {
      const user = await Users.findOne( { socketId: socket.id } );

      if ( user ) {
        await Users.findByIdAndUpdate(
          user._id,
          { lastSeen: new Date() },
          { new: true }
        );

        console.log( `Updated lastSeen for user ${ user.email }` );
      } else {
        console.warn( 'No user found for socketId:', socket.id );
      }
    } catch ( err ) {
      console.error( 'Error updating lastSeen on disconnect:', err );
    };
  } )
} );

app.use( express.json() );
app.use( cors() );

app.get( '/', ( req, res ) => {
  res.send( '<h1>Hello Server!</h1>' );
} );


server.listen( 3002, () => {
  console.log( 'listening on *:3002' );
} );

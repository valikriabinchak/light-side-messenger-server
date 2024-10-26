const express = require( 'express' );
const cors = require( 'cors' );
const userRoutes = require( './routes/userRoutes' );
const messageRoutes = require( './routes/messageRoutes' );
const friendRoutes = require( './routes/friendRoutes' );
const bodyParser = require( 'body-parser' );

const app = express();

app.use( cors() );
app.use( bodyParser.json() );

app.use( '/user', userRoutes );
app.use( '/messages', messageRoutes );
app.use( '/friends', friendRoutes );

module.exports = app;

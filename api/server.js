const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
// Using express-session will enable us to store the cookie received by the client and let them stay logged in.
// However the session authentication will be lost once the server restarts
const session = require("express-session")

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */
//using connect-session-knex package so that the session is stored directly in the database instead of memory
const KnexSessionStore = require("connect-session-knex")(session)
const db = require("../data/db-config.js")
const usersRouter = require("./users/users-router")
const authRouter = require("./auth/auth-router.js");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(session({
  name: 'chocolatechip',
  //Avoids recreating the sessions that have not changed
  resave: false,
  //Only create sessions for users that are logged in
  saveUninitialized: false,
  secret: "keep it secret keep it safe",

  //store property will let us store the session directly inside the database
  store: new KnexSessionStore({
    //configured instance of knex
    knex: db,
    // creates a session table automatically, rather than doing a migration for it
    createtable: true,
  })
}))

server.use(authRouter)
server.use(usersRouter)

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;

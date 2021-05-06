const Users = require("../users/users-model.js")
const bcrypt = require("bcryptjs")

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
// Use when accessing users data
function restricted() {
  return async (req, res, next) => {
    try {
      if (!req.session || !req.session.user) {
        return res.status(401).json({
          message: "You shall not pass!",
        })
      }

      next()

    } catch (err) {
      next(err)
    }
  }

}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/

// Use when creating a new user profile
function checkUsernameFree() {
  return async (req, res, next) => {
    try {
      const { username, password } = req.body
      //Checks for the same username in the database
      const boolUserExists = await Users.findBy({ username }).first()

      if (boolUserExists) {
        return res.status(422).json({
          message: "Username taken",
        })
      }

      next()

    } catch (err) {
      next(err)
    }
  }

}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
// Use when the user is trying to login
function checkUsernameExists() {
  return async (req, res, next) => {
    try {
      const { username, password } = req.body
      const existingUser = await Users.findBy({ username }).first()

      if (!existingUser) {
        return res.status(401).json({
          message: "Invalid Credentials"
        })
      }

      const passwordIsValid = await bcrypt.compare(password, existingUser.password)

      if (!passwordIsValid) {
        return res.status(401).json({
          message: "Invalid Credentials"
        })
      }

      req.user = existingUser
      next()

    } catch (err) {
      next(err)
    }
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
// Use when a new user profile is being created
function checkPasswordLength() {
  return (req, res, next) => {
    if (!req.body.password || req.body.password.length <= 3) {
      return res.status(422).json({
        message: "Password must be longer than 3 chars",
      })
    } else {
      next()
    }
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules

module.exports = {
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree,
  restricted,
}

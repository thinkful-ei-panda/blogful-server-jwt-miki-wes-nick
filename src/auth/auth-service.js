const jwtAuth = require('../middleware/jwt-auth');

const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {
  getUserWithUserName(db, user_name){
    return db('blogful_users')
      .select('*')
      .where({ user_name })
      .first();
  },


  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  }
};

module.exports = AuthService;
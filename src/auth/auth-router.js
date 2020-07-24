const express = require('express');
const AuthRouter = express.Router();

AuthRouter
  .route('/login')
  .post(express.json(), (req,res,next) => {
    const {user_name, password} = req.body;
    const loginUser = { user_name, password};

    for(const [key,value] of Object.entries(loginUser)){
      if(!value)
        return res.status(400).json({
          error: `Missing '${key} in request body`
        });        
    }

    next();

    
  });

module.exports = AuthRouter;
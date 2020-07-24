const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthRouter = express.Router();

AuthRouter
  .route('/login')
  .post(express.json(), async (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

    for (const [key, value] of Object.entries(loginUser)) {
      if (!value)
        return res.status(400).json({
          error: `Missing '${key} in request body`
        });
    }

    const user = await req.app.get('db')('blogful_users')
      .select('*')
      .where({ user_name })
      .first()
      .catch(next);
    if (!user)
      return res.status(401).json({ error: 'Incorrect username or password' });

    const passwordMatch = await bcrypt.compare(password, user.password).catch(next);

    if (!passwordMatch)
      return res.status(401).json({ error: 'Incorrect username or password' });

    const token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET,
      {
        subject: user.user_name
      }
    );

    res.json({ authToken: token });
    next();


  });

module.exports = AuthRouter;
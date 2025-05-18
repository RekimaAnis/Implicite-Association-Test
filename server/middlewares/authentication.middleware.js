const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

const authentication = (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, jwtConfig.SECRET_TOKEN);
    req.userLogin = decoded.login;
    next();
  } catch (err) {
    res.status(401).redirect('/html/login.html');
  }
};

module.exports = authentication;

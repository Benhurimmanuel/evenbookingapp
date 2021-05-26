const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  //   console.log(authHeader)
  const token = authHeader;
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  console.log(process.env.token, token);
  let verifiedToken;
  console.log("0utside try");
  try {
    console.log("inside try");
    verifiedToken = jwt.verify(token, process.env.token);
    console.log(verifiedToken);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!verifiedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = verifiedToken.userId;
  next();
};

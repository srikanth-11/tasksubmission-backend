const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  if (req.headers.authorization) {
    console.log(req.headers.authorization);

    jwt.verify(
      req.headers.authorization,
      process.env.SECRET_KEY,
      function (err, data) {
        if (data) {
          console.log(data);
          if (data.email) {
            req.body.userid = data.userid;
            req.body.email = data.email;
            req.body.username = data.username;
            req.body.role = data.role;
            next();
          } else {
            res.status(401).json({
              message: "Not Authorized",
            });
          }
        } else {
          res.status(400).json({
            message: "Invalid Token",
          });
        }
        if (err) throw err;
      }
    );
  } else {
    res.status(400).json({
      messsage: "No Token Present",
    });
  }
}
module.exports = authenticate;

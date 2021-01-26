const jwt = require("jsonwebtoken");
const jwtSecret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const auth = (req, res, next) => {
    try{
        const token = req.header("x-auth-Debasis");
        if(!token) {
            res.json({
                message:"UnAuthorize",
                result:"Failed",
            })
        }
        const verifyToken = jwt.verify(token,jwtSecret);
        if(!verifyToken){
            res.json({
                message:"UnAuthorize",
                result:"Failed",
            })
        }
        req.id = verifyToken.id;
        next();
    }catch(err) {
        res.json({
            message:"UnAuthorize",
            result:"Failed",
        })
    }
}
module.exports = auth;
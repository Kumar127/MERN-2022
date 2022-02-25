const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req,res,next) =>{
    // token 
    const token = req.header('x-api-key');
    //token check
    if(!token) {
        res.status(401).json({msg:'No token, authentication Denied'})
    }
    //verify token 
    try {
        const decoded = jwt.verify(token, config.get('jwtToken'));
        req.user = decoded.user;
        next();

    } catch(err) {

        res.status(401).json({msg:" Token is not valid"});
    }
    
}
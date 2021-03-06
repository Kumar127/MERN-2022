const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route GET api/users
// @desc Register a User
// @access Public
router.post('/',[
    check('name','Name is Required').not().isEmpty(),            
    check('email','Email is Required').isEmail(),            
    check('password','Please enter a password with 6 or more character').isLength({min: 6}),            
],async(req,res) =>{
    const errors =  validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})

    }
    // see if user Exists.
        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({errors:[{msg:'USer Already exists'}]})
            }
    // Gravatar
        const avatar = gravatar.url(email, {
            s:'200',
            r:'pg',
            d:'mm',
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })
    // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        // Return jsonWebToken
        const payload = {
            user :{
                id:user.id
            }
        }

        jwt.sign(payload, 
            config.get('jwtToken'),
            { expiresIn:360000 },
            (err,token) =>{
                if(err) throw err;
                res.json({token})
        })
        // res.send('User registered');
        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server error')
        }

})
module.exports = router;
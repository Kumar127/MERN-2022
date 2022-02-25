const express = require('express');
const router = express.Router();
const auth = require('../../middleWare/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult } = require('express-validator');
// @route GET api/auth
// @desc Test route
// @access Public
router.get('/',auth,async (req,res) =>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err) {
        res.status(500).json({msg:"error while token validation"});
    }
})

// @route POST api/users
// @desc Authenticate a User
// @access Public
router.post('/',[           
    check('email','Email is Required').isEmail(),            
    check('password','Password is required').exists(),            
],async(req,res) =>{
    const errors =  validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})

    }
    // see if user Exists & password check
        const { email, password } = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({errors:[{msg:'Invalid credentials'}]})
            }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) {
            return res.status(400).json({errors:[{msg:'Invalid credentials'}]})
        }

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
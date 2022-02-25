const express = require('express');
const router = express.Router();
const auth = require('../../middleWare/auth');
const User = require('../../models/User');

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
module.exports = router;
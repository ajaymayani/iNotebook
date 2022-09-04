const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "thisismyjwtsecretkey";
const fetchuser = require('../middleware/fetchuser');

//Create new user using : POST "api/auth/createuser"
router.post('/createuser', [
    body('name', 'Enter valid name').isLength({ min: 3 }),
    body('email', 'Enter valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const sec_pass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({ name: req.body.name, email: req.body.email, password: sec_pass });

        const data = {
            user: {
                id: user.id
            }
        }
        const token = jwt.sign(data, JWT_SECRET);

        res.json({ token });
    } catch (e) {
        res.status(500).send("Internal server error");
    }
})

//Authenticate a user using : POST "api/auth/login"
router.post('/login', [
    body('email', 'please enter valid email').isEmail(),
    body('password', 'password cant not be empty').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { email, password } = req.body;
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }

        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const token = jwt.sign(data, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).send("Internal server error")
    }

})

//Get the loggedin user details using : POST /api/auth/getuser
router.post('/getuser', fetchuser, async (req, res) => {


    try {
        const userId = req.user.id;
        console.log(userId)
        const user = await User.findOne({ _id: userId }).select('-password');
        res.send(user);
        // console.log(user)
    }
    catch (e) {
        res.status(500).send("Internal server error" + e.message);
    }
})
module.exports = router;
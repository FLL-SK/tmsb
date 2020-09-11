import express from 'express';
import passport from 'passport';

const router = express.Router();
module.exports = router;

//When the user sends a post request to this route, passport authenticates the user based on the
//middleware created previously
router.post('/', passport.authenticate('signup', { session: false }), async (req, res, next) => {
    res.json({
        message: 'Signup successful',
        user: req.user,
    });
});

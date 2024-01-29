const passport = require("passport");
const {Strategy} = require("passport-google-oauth2");
const bcrypt = require("bcrypt");
const {v4: uuidv4 } = require("uuid");

const { User } = require("../models/userModel");

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL} = process.env;

const googleParams = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/user/google/callback`,
    response_type: 'code',
    passReqToCallback: true,
    scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"].join(" "),
}

const googleCallback = async(req, accessToken, refreshToken, profile, done) => {
    try {
        const {email, displayName} = profile;
        const user = await User.findOne({email});
        if(user) {
            return done(null, user); // req.user = user;
        }
        const password = await bcrypt.hash(uuidv4(), 10);
        const newUser = await User.create({email, password, name: displayName});
        done(null, newUser);
    }
    catch(error) {
        done(error, false);
    }
}

const googleStrategy = new Strategy(googleParams, googleCallback);

passport.use("google", googleStrategy);

module.exports = passport;
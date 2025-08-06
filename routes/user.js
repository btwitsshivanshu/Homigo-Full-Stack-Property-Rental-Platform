const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const {create} = require("../controllers/users.js");

router.get("/signup", (req, res) => {
    res.render("./users/signup.ejs");
    

});

router.post("/signup", wrapAsync(create));


router.get("/login", (req, res) => {
    res.render("./users/login.ejs");
    

});

router.post("/login",saveRedirectUrl,passport.authenticate("local", {failureRedirect:'/user/login',failureFlash:true}), async(req, res) => {
    req.flash("success", "Welcome back to Homigo!");
    res.redirect(res.locals.redirectUrl || "/listings");
});


router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye! You have successfully logged out.");
        res.redirect("/listings");
    });
});


module.exports = router;
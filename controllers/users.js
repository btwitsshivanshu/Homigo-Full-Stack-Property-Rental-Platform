const User = require("../models/user.js");


module.exports.create=async (req, res) => {
    try {
        let { username, password, email } = req.body;
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "An account with this email already exists. Please try logging in instead.");
            return res.redirect("/user/login");
        }
        const newUser = new User({ username, email, password });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Homigo! User Successfully Registered !!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/user/signup");
    }
}
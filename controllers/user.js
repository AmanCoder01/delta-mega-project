const User = require("../models/user");

module.exports.signup = (req, res) => {
    res.render("user/signup.ejs");
}

module.exports.signupSSuccess = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        let reg = await User.register(newUser, password);
        // console.log(reg);
        req.login(reg, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Registered Successfully , Welcome to Wanderlust");
            res.redirect("/listings");

        })
    } catch (e) {
        req.flash("error", "User Already exist");
        res.redirect("/signup");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("user/login.ejs");
}

module.exports.loginSuccess =  async (req, res) => {
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    let redirectUrl =res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    })
}
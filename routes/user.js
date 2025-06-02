const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const User = require("../models/users.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middelware.js");


router.get(
  "/signup",
  wrapAsync(async (req, res) => {
    res.render("user/signup.ejs");
  })
);

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let user = req.body.user;

      let newUsr = new User({
        email: user.email,
        username: user.username,
      });

      let usr1 = await User.register(newUsr, user.password);
      req.login(usr1, (err) => {
        if (err) {
          next(err);
        }
        req.flash("success", "Welcome to Travellers");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get(
  "/login",
  wrapAsync(async (req, res) => {
    res.render("user/login.ejs");
  })
);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to Travellers");
    let redirUrl = res.locals.RedirectUrl || "/listings"
    res.redirect(redirUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    res.redirect("/listings");
    req.flash("sucess", "You are logged out!!");
  });
});

module.exports = router;

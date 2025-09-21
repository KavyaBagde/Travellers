if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

//needed requirements
const express = require("express");
const app = express();
const port = 2001;
const mongoose = require("mongoose");
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");


//
let db_url = process.env.ATLAS_DB;
let Secret = process.env.SECRET;

// routres
const listingsRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
const _ = require('passport-local-mongoose');

const store = MongoStore.create({
  mongoUrl: db_url,
  crypto :{
    secret : Secret,
  },
  touchAfter : 24 * 60 *60 ,
});

store.on("error" , ()=>{
  console.log("error in Mongo sessions" , err)
} )

//sesson obtionss
const sessionObtions = {
  store,
  secret : Secret,
  resave: false,
  saveUninitialized: true,
  cookie : {
    expires : Date.now() + (7 * 24 * 60 * 60 * 1000),
    maxAge : 7 * 24 * 60 * 60 * 1000 ,
    httpOnly : true,
  }
};

// expess to use 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);

// mongo connection
main()
  .then(() => {
    console.log("connection sucessful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(db_url);
}

//session + flash
app.use(session(sessionObtions));
app.use(flash());

// psaapost 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash to use by every route
app.use((req , res , next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
})

// custome routes
app.use("/listings" , listingsRoute);
app.use("/listings/:id/reviews" , reviewRoute);
app.use("/" , userRoute);

//page not found
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

//error message
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("error.ejs" , {message});
});

//listner
app.listen(port, () => {
  console.log(`listings to port ${port}`);
});




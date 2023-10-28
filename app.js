if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}
const express = require("express");
const app = express();
const ExpressError = require("./utils/ExpressError");

// local storage session 
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const dbUrl = process.env.ATLASDB_URL;



const listing = require("./routes/listing");
const review = require("./routes/review");
const userRouter = require("./routes/user");


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");





// local storage session 
const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter:24*3600,
})

store.on("error",()=>{
  console.log("SESSION STORE ERROR");
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true
  }
};

app.use(session(sessionOptions));
app.use(flash());





app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//create layout ejsmate
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);


//ejs
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// style or public static files  setting middlewares
app.use(express.static(path.join(__dirname, "/public")));

// Parse data from params
app.use(express.urlencoded({ extended: true }));

//method -override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));




// dat base connection
const mongoose = require("mongoose");


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch(err => console.log(err));

async function main() {
  // await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  await mongoose.connect(dbUrl);
}



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})




app.use("/listings", listing);


app.use("/listings/:id/reviews", review); //use merge params
app.use("/", userRouter);


//Error handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
})


//Error handling 
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
})


app.listen(8080, () => {
  console.log("App Listening");
})                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
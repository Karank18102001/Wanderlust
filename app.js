if(process.env.NODE_ENV != "production")
{
    require('dotenv').config();   
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); //ejs file
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js"); // express error
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

const listingsrouter = require("./routes/listing.js");
const reviewsrouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
;

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    // Use connect method to connect to the server
    await mongoose.connect(dbUrl);
}


main()
.then((res) =>
{
    console.log("connected to db");
})
.catch((err ) =>
{
    console.log(err);
});

// setup for EJS 
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);  // for all ejs templates
app.use(express.static(path.join(__dirname,"/public"))); // to use css

const Store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24 * 3600,
});

Store.on("error", () =>
{
    console.log("error in mongo session store",err);
});


// to use sessions
const sessionOptions = {
    Store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

//  passport implementation
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//  implementing flash
app.use((req,res,next) =>
{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


//  routes
app.use("/listings", listingsrouter);
app.use("/listings/:id/reviews",reviewsrouter);
app.use("/",userRouter);


// throw error to whole page to other route
app.all("*", (req,res,next) =>
{
    next(new ExpressError(404, "page not found!"));
});
    
    
//      express error middleware
app.use((err,req,res,next) =>
{
    let { statusCode = 500, message ="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});


//  To check the server working
app.listen(8080, () =>
{
    console.log("server is working");
});


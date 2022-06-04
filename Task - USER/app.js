if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const UserData = require("./models/userModel");

const initializePassport = require("./passport-config");
const req = require("express/lib/request");
initializePassport(
  passport,
  (email) =>
    UserData.findOne({ email: email }).then((res) => {
      //  console.log(res);
      return res;
    }),
  (id) =>
    UserData.findOne({ id: id }).then((res) => {
      {
        //   console.log(res);
        return res;
      }
    })
);

// UserData.find()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

app.set("views", "./views");
app.set("view-engine", "ejs");

app.set("etag", false);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("home.ejs", { name: req.user?.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userDetails = new UserData({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    userDetails.save((err, doc) => {
      if (!err) {
        req.flash("success", "User added successfully!");
        res.redirect("/login");
      } else console.log("Error during record insertion : " + err);
    });
    // res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.redirect("/register");
  }
});

app.get("/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
  });
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});

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
const adminCredentials = require("./models/adminModel");
const UserData = require("./models/userModel");
let result = [];
let newResult = [];
const initializePassport = require("./passport-config");
UserData.find({}, (err, res) => {
  if (err) throw new Error(err.message, null);
  result = res;
});

app.set("etag", false);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const req = require("express/lib/request");
initializePassport(
  passport,
  (email) =>
    adminCredentials.findOne({ email: "admin@gmail.com" }).then((res) => {
      //  console.log(res);
      return res;
    }),
  (id) =>
    adminCredentials
      .findOne({ id: 'ObjectId("62989a6ac585661803b1149a")' })
      .then((res) => {
        {
          //   console.log(res);
          return res;
        }
      })
);

// async function getUserData() {
//   let userdata = null;
//   await UserData.find().then((res) => {
//     userdata = res;
//   });
//   return userdata;
// }

// let userdata = getUserData();
// console.log(userdata);

// UserData.find()
//   .then((res) => console.log(res.json))
//   .catch((err) => console.log(err));

app.set("views", "./views");
app.set("view-engine", "ejs");
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
  UserData.find({}, (err, response) => {
    if (err) throw new Error(err.message, null);
    result = response;
  });
  UserData.find({ email: req.body.search }, (err, res) => {
    if (err) throw new Error(err.message, null);
    newResult = res;
  });
  console.log(result, newResult);
  res.render("adminHome.ejs", { title: "Admin Panel", result, newResult });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("adminLogin.ejs");
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

// app.get("/register", checkNotAuthenticated, (req, res) => {
//   res.render("register.ejs");
// });

app.post("/register", async (req, res) => {
  UserData.find({}, (err, response) => {
    if (err) throw new Error(err.message, null);
    result = response;
  });
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
        console.log("User added successfully");
        UserData.find({}, (err, response) => {
          if (err) throw new Error(err.message, null);
          result = response;
        });
        res.redirect("/");
      } else console.log("Error during record insertion : " + err);
    });
    // res.redirect("/login");
  } catch (err) {
    console.log(err);
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

app.post("/deleteuser", async (req, res) => {
  console.log(req.body.id);
  console.log(result);
  await UserData.deleteOne({ email: req.body.id }).then(console.log("success"));
  UserData.find({}, (err, res) => {
    if (err) throw new Error(err.message, null);
    result = res;
  });
  res.redirect("/");
});

app.post("/searchusers", (req, res) => {
  console.log(req.body.search);

  UserData.find({ email: req.body.search }, (err, res) => {
    if (err) throw new Error(err.message, null);
    newResult = res;
  });
  res.redirect("/");
});

// UserData.deleteOne({ email: "admin@gmail.com" }).then(console.log("success"));

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

const port = process.env.PORT || 8080;
app.listen(port, function () {
  console.log(`Admin server Has Started on port ${port}`);
});

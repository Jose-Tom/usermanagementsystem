const mongoose = require("mongoose");

// Database connection

mongoose.connect("mongodb://localhost/node-mongodb", { useNewUrlParser: true });
const conn = mongoose.connection;
conn.on("connected", function () {
  console.log("database is connected successfully");
});
conn.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));

// create an schema

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "This field is required"],
  },
  password: {
    type: String,
    required: [true, "This field is required"],
    min: [6, "Too few characters in the password (min 6)."],
    max: [12, "Too many characters in the password (max 12)."],
  },
  email: {
    type: String,
    match: /.+\@.+\..+/,
    required: [true, "This field is required"],
  },
});

module.exports = mongoose.model("users", userSchema);

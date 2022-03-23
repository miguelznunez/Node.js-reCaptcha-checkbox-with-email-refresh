const express = require("express");
var request = require("request");
const sendMail = require("./mail.js");
require("dotenv").config();

const app = express();

// Access pubic folder
app.use(express.static('public'));

// Parse HTML forms
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

// Template engine
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/submitForm", (req, res) => {
  if(
    req.body['g-recaptcha-response'] === undefined ||
    req.body['g-recaptcha-response']  === "" ||
    req.body['g-recaptcha-response']  === null
  ){
    return res.render("index", {success: false, message : "Please select captcha"})
  }
  // Secret Key
  const secretKey = process.env.SECRET_KEY;
  // Verify URL
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body['g-recaptcha-response'] }&remoteip=${req.socket.remoteAddress}`;

  //Make request to verify URL
  request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body);

    // If not succesfull
    if(body.success !== undefined && !body.success){
      return res.render("index" , {success: false, message: "Failed captcha verification"});
    }
    const { email, name, message } = req.body;
    sendMail(email, name, message, function(err, data) {
      if (!err) return res.render("index", {success:true, message:"Message was sent"});
      else return res.render("index", {success:false, message:"Internal error"});
    }); 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port${PORT}`);
});
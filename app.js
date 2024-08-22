const express = require("express");
const app = express();
const path = require("path");
const usermodule = require("./models/user");
const adminmodule = require("./models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require('multer') 
const crypto = require('crypto')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function(err, bytes){
      
      let fn = bytes.toString("hex")+path.extname(file.originalname)
      cb(null,fn)
     })
  }
})
const upload = multer({ storage: storage })


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render("registration");
});
app.post("/admin", function (req, res) {
  const { email, password } = req.body;

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      await adminmodule.create({
        email,
        password: hash,
      });
    });
  });
  const token = jwt.sign({ email: email, password: password }, "64bits");
  res.cookie("token", token);
  res.redirect("/createuser");
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/loginadmin", async function (req, res) {
  const { email, password } = req.body;
  let useremail = await adminmodule.findOne({ email });
  if (!useremail) res.send("something went wrong");
  else {
    bcrypt.compare(password, useremail.password, function (err, result) {
      if (result) res.redirect("/createuser");
      else res.send("something went wrong");
    });
    const token = jwt.sign({ email: email, password: password }, "64bits");
    res.cookie("token", token);
  }
});

app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/createuser", isloggedin, function (req, res) {
  res.render("index");
});

app.get("/users", isloggedin, async function (req, res) {
  const admin = jwt.verify(req.cookies.token, "64bits");
  let adminid = await adminmodule
    .findOne({ email: admin.email })
    .populate("user");
  res.render("users", { users: adminid.user });
});

app.post("/create", upload.single('image') , async function (req, res) {
  const { name, email } = req.body;

  let user = await usermodule.create({
    name,
    email,
    image: req.file.filename
  });
  const admin = jwt.verify(req.cookies.token, "64bits");
  const adminid = await adminmodule.findOne({ email: admin.email });
  await adminid.user.push(user._id);
  adminid.save();
  res.redirect("/users");
});

app.get("/delete/:id", async function (req, res) {
  await usermodule.findOneAndDelete({ _id: req.params.id });
  res.redirect("/users");
});
app.get("/edit/:id", async function (req, res) {
  let user = await usermodule.findOne({ _id: req.params.id });
  res.render("edit", { user });
});

app.post("/update/:id", async function (req, res) {
  const { name, email, image } = req.body;
  await usermodule.findOneAndUpdate(
    { _id: req.params.id },
    { name: name, email: email, image: image }
  );
  res.redirect("/users");
});

function isloggedin(req, res, next) {
  if (req.cookies.token === "") {
    res.send("you are not authorized");
  } else {
    let data = jwt.verify(req.cookies.token, "64bits");
    req.user = data;
    next();
  }
}

app.listen(3000, function () {
  console.log("the server is running on port 3000");
});

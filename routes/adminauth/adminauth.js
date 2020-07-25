const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  fname: Joi.string().min(3).required(),
  lname: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  //CHECKING IF USER EMAIL ALREADY EXISTS
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) res.status(400).send("Email already exists");

  //HASHING THE PASSWORD

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //ON PROCESS OF ADDING NEW USER

  const user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: hashedPassword,
    type: "admin",
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW USER IS ADDED

      const saveUser = await user.save();
      //   res.send({ user: user._id });
      res.send("user created");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//SIGNIN USER

router.post("/login", async (req, res) => {
  //CHECKING IF USER EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Incorrect Email- ID");

  //CHECKING IF USER PASSWORD MATCHES

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect Password");

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //   res.send("success");
      if (user.type === "admin") {
        const token = jwt.sign(
          { _id: user._id },
          process.env.ADMIN_TOKEN_SECRET
        );
        res.header("auth-token", token).send(token);
      } else {
        res.send({ message: "seems like you are not a admin" });
      }
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//FORGET PASSWORD

router.post("/forgotpassword", async (req, res) => {
  //CHECK IF EMAIL EXISTS IN DATABASE

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Mail Id doesn't exist");

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "shelcia@gmail.com",
        pass: "ROSHN2014",
      },
    });

    console.log("created");
    await transporter.sendMail({
      from: "shelcia@gmail.com",
      to: req.body.email,
      subject: "hello world!",
      text: "hello world!",
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;

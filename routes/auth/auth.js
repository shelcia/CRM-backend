const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  userId: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  type: Joi.string().min(3).required(),
});

const loginSchema = Joi.object({
  userId: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  //CHECKING IF USERID ALREADY EXISTS
  const userIdExist = await User.findOne({ userId: req.body.userId });
  if (userIdExist) {
    res.status(200).send({
      status: "400",
      message: "User ID/ admission ID already exists",
    });
    return;
  }

  //HASHING THE PASSWORD

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //ASSIGN TOKEN
  const token = jwt.sign(
    { userId: req.body.userId, type: req.body.type },
    process.env.TOKEN_SECRET
  );

  //ON PROCESS OF ADDING NEW USER

  const user = new User({
    name: req.body.name,
    userId: req.body.userId,
    password: hashedPassword,
    type: req.body.type,
    token: token,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    else {
      //NEW USER IS ADDED
      const saveUser = await user.save();
      res.status(200).send({ status: "200", message: "user created" });
    }
  } catch (error) {
    res.status(200).send({ status: "500", message: error });
  }
});

router.post("/login", async (req, res) => {
  //CHECKING IF USER EMAIL EXISTS

  const user = await User.findOne({ userId: req.body.userId });
  if (!user)
    return res
      .status(200)
      .send({ status: "400", message: "Incorrect Admission ID" });

  //CHECKING IF USER PASSWORD MATCHES

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res
      .status(200)
      .send({ status: "400", message: "Incorrect Password" });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error)
      return res
        .status(200)
        .send({ status: "400", message: error.details[0].message });
    else {
      res
        .status(200)
        .header("auth-token", user.token)
        .send({
          status: "200",
          message: { token: user.token, type: user.type },
        });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: error });
  }
});

module.exports = router;

const router = require("express").Router();
const User = require("../models/User");

//VALIDATION OF USER INPUTS
const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  name: Joi.string().min(6).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  //checking if user'a mail already exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) res.status(400).send("Email already exists");

  //New User is added
  try {
    //validate the user inputs
    const { error } = await registerSchema.validateAsync(req.body);
    if (error) res.status(400).send(error.details[0].message);
    else {
      const saveUser = await user.save();
      res.send(saveUser);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

const router = require("express").Router();
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const verify = require("./verify");

// need to be changed
const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().min(2).required(),
  permissions: Joi.array().required(),
  company: Joi.string().required(),
});

//GET ALL USERS By Company
router.get("/", verify, async (req, res) => {
  try {
    const contacts = await User.find().exec();
    res.status(200).send({ status: "200", message: contacts });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "500", message: error });
  }
});

router.post("/", verify, async (req, res) => {
  try {
    //VALIDATION OF USER INPUTS
    const { error } = await registerSchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({ status: "400", message: error });
      return;
    } else {
      const contact = new User(req.body);
      await contact.save();
      res
        .status(200)
        .send({ status: "200", message: "User Created Successfully" });
    }
  } catch (err) {
    res.status(200).send({ status: "500", message: err });
  }
});

module.exports = router;

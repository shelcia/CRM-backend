const router = require("express").Router();
const Contacts = require("../../models/Contacts");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const verify = require("./verify");

// need to be changed
const contactSchema = Joi.object({
  title: Joi.string().min(3).required(),
  client: Joi.string().min(3).required(),
  manager: Joi.string().min(3).required(),
  expected_revenue: Joi.number().min(2).required(),
  probability: Joi.number().required(),
  status: Joi.string().min(2).required(),
  expected_closing: Joi.date().required(),
  priority: Joi.string().min(2).required(),
});

//GET ALL CONTACTS

router.get("/", verify, async (req, res) => {
  try {
    const contacts = await Contacts.find().exec();
    res.status(200).send({ status: "200", message: contacts });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "200", message: error });
  }
});
module.exports = router;

const router = require("express").Router();
const Company = require("../../models/Company");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");
const verify = require("../verify");

// need to be changed
const companySchema = Joi.object({
  company: Joi.string().min(2).required(),
  number: Joi.string(),
  cmail: Joi.string().email().required(),
  address: Joi.string(),
  website: Joi.string(),
  companySize: Joi.array(),
  logo: Joi.binary(),
});

//GET ALL COMPANY

router.get("/", verify, async (req, res) => {
  try {
    const company = await Company.findById(req.body.id);
    res.status(200).send({ status: "200", message: company });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "500", message: error });
  }
});

router.post("/", verify, async (req, res) => {
  try {
    //VALIDATION OF USER INPUTS
    const { error } = await companySchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({ status: "400", message: error });
      return;
    } else {
      const contact = new Company(req.body);
      await contact.save();
      res
        .status(200)
        .send({ status: "200", message: "Company Created Successfully" });
    }
  } catch (err) {
    res.status(200).send({ status: "500", message: err });
  }
});

module.exports = router;

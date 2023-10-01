const router = require("express").Router();
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const verify = require("./verify");
const inviteUserTemplate = require("../../templates/inviteUserTemplate");
const feLink = require("../../link");
const nodemailer = require("nodemailer");

const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

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
    const users = await User.find().exec();
    res.status(200).send({ status: "200", message: users });
  } catch (error) {
    console.log(error);
    res.status(200).send({ status: "500", message: error });
  }
});

router.post("/", verify, async (req, res) => {
  try {
    //VALIDATION OF USER INPUTS
    const { error } = await registerSchema.validateAsync(req.body);
    // CHECKING IF USERID ALREADY EXISTS
    if (!error) {
      const emailExist = await User.findOne({ email: req.body.email });
      if (emailExist) {
        res.status(400).json({
          status: "400",
          message: "This email is already in use",
        });
        return;
      }

      const user = new User(req.body);
      await user.save();

      //GENERATE TOKEN
      const encryptedString = cryptr.encrypt(user._id);

      const link = `${feLink}verification/${encryptedString}`;

      const transporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PWD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: req.body.email,
        subject: `Your Company Admin has invited You to Join Easy CRM`,
        html: inviteUserTemplate(link, req.body.email, req.body.password),
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          // res.status(401).send("error");
          res
            .status(401)
            .json({ status: "401", message: "Mail Authentication Error" });
        } else {
          console.log("Email sent: " + info.response);
          // needs to be changed
          res.status(200).json({
            status: "200",
            message: "User Created Successfully",
          });
        }
      });

      res
        .status(200)
        .json({ status: "200", message: "User Created Successfully" });
    }
  } catch (err) {
    if (err.details) {
      res
        .status(400)
        .json({ status: "500", message: err?.details[0]?.message });
    } else {
      res.status(500).json({ status: "500", message: err });
    }
  }
});

module.exports = router;

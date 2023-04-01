const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const nodemailer = require("nodemailer");

const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

const verificationEmailTemplate = require("../../templates/verificationTemplate");
const resetPwdTemplate = require("../../templates/resetPwdTemplate");
const feLink = require("../../link");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  try {
    // CHECKING IF USERID ALREADY EXISTS
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      res.status(200).send({
        status: "400",
        message: "Email Id already exists",
      });
      return;
    }

    // HASHING THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let permissions = [];
    if (req.body.role === "admin") {
      permissions = [...permissions, "all"];
    }

    // CREATE TOKEN
    const token = jwt.sign(
      { email: req.body.email, type: req.body.type, permissions: permissions },
      process.env.TOKEN_SECRET
    );
    //VALIDATION OF USER INPUTS
    const { error } = await registerSchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({ message: error });
      return;
    } else {
      //ON PROCESS OF ADDING NEW USER
      const user = new User({
        ...req.body,
        password: hashedPassword,
        token: token,
        permissions: permissions,
      });

      //NEW USER IS ADDED
      await user.save();

      //GENERATE TOKEN
      const encryptedString = cryptr.encrypt(req.body.email);

      const link = `${feLink}verification/${encryptedString}`;
      // console.log(process.env.EMAIL, process.env.PASSWORD);

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
        subject: `Activation mail for Easy CRM`,
        html: verificationEmailTemplate(link),
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          // res.status(401).send("error");
          res.status(200).send({ status: "401", message: "Error" });
        } else {
          console.log("Email sent: " + info.response);
          // needs to be changed
          res.status(200).send({
            status: "200",
            message: "User Created Successfully",
          });
        }
      });
    }
  } catch (error) {
    res.status(200).send({ status: "500", message: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    //CHECKING IF USER EMAIL EXISTS

    const user = await User.findOne({ userId: req.body.userId });
    if (!user) {
      res.status(200).send({ status: "400", message: "Incorrect Email" });
      return;
    }

    //CHECKING IF USER PASSWORD MATCHES

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      res.status(200).send({ status: "400", message: "Incorrect Password" });
      return;
    }

    if (!user.verified) {
      res
        .status(200)
        .send({ status: "400", message: "User not Verified yet !" });
      return;
    }

    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error) {
      res
        .status(200)
        .send({ status: "400", message: error.details[0].message });
      return;
    } else {
      res
        .status(200)
        .header("auth-token", user.token)
        .send({
          status: "200",
          message: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.token,
            permissions: user.permissions,
          },
        });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: error });
  }
});

router.put("/verification/:id", async (req, res) => {
  // console.log(req.params.id);
  const decryptedString = cryptr.decrypt(req.params.id);
  const query = await User.where({ email: decryptedString });
  try {
    if (query.length === 0) {
      res.status(200).send({ status: "400", message: "Invalid String" });
      return;
    }
    const activate = await User.findById(query[0]._id).exec();
    activate.set({ verified: true });
    // console.log("verified");
    await activate.save();
    res.status(200).send({ status: "200", message: "Account Verified !" });
  } catch (error) {
    res.status(200).send({ status: "400", message: "Verification failed" });
  }
});

router.post("/resend", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  try {
    if (user) {
      //GENERATE TOKEN
      const encryptedString = cryptr.encrypt(req.body.email);

      const link = `${feLink}verification/${encryptedString}`;
      // console.log(process.env.EMAIL, process.env.PASSWORD);

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
        subject: `Activation mail for Easy CRM`,
        html: verificationEmailTemplate(link),
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          // res.status(401).send("error");
          res.status(200).send({ status: "401", message: "Error" });
        } else {
          console.log("Email sent: " + info.response);
          res
            .status(200)
            .send({ status: "200", message: "Verification mail sent !" });
        }
      });
    } else {
      res
        .status(200)
        .send({ status: "400", message: "Email doesn't seem to exist" });
    }
  } catch (error) {
    res
      .status(200)
      .send({ status: "400", message: "Resending Verification Email Failed" });
  }
});

//GENERATE PASSWORD RESET LINK AND SEND THROUGH EMAIL
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    //CHECK IF EMAIL EXIST
    const user = await User.findOne({ email: { $eq: req.body.email } });
    if (!user) {
      res.status(200).send({
        status: "400",
        message: "Email does not exist",
      });
      return;
    }

    //GENERATE TOKEN
    const encryptedString = cryptr.encrypt(req.body.email);

    const link = `${feLink}reset-password/${encryptedString}`;
    // console.log(process.env.EMAIL, process.env.PASSWORD);

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
      subject: `Reset Password for Easy CRM`,
      html: resetPwdTemplate(link),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        // res.status(401).send("error");
        res.status(200).send({ status: "401", message: "Error" });
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send({
          status: "200",
          message: `Verification link sent to ${email}. \nCheck your inbox`,
        });
      }
    });
  } catch (err) {
    res.status(200).send({
      status: "500",
      message: "Something went wrong",
    });
  }
});

const pwdResetSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

//GET TOKEN AND CHANGE PASSWORD OF THE USER
//IF TOKEN IS VERIFIED
router.put("/change-password/:token", async (req, res) => {
  try {
    //VALIDATION OF USER INPUTS
    const { error } = await pwdResetSchema.validateAsync(req.body);
    if (error) {
      res.status(200).send({
        status: "400",
        message: error,
      });
    }

    const decryptedString = cryptr.decrypt(req.params.token);
    const query = await User.where({ email: decryptedString });
    if (query.length === 0) {
      res.status(200).send({ status: "400", message: "Invalid String" });
      return;
    }
    const user = await User.findById(query[0]._id).exec();

    //HASHING THE PASSWORD

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.set({ password: hashedPassword });
    await user.save();
    res
      .status(200)
      .send({ status: "200", message: "Password Changed Successfully!" });
  } catch (error) {
    res.status(200).send({ status: "500", message: "Password Change failed" });
  }
});

module.exports = router;

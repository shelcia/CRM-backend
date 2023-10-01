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
const Company = require("../../models/Company");
const { handleError } = require("../../helpers/handleResponses");

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().min(2).required(),
  permissions: Joi.array(),
  cname: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  try {
    const { cname, email, password, role, type } = req.body;

    // Check if company name already exists
    const companyExist = await Company.findOne({ name: cname });
    if (companyExist) {
      return handleError(res, 400, "Company already exists");
    }

    // Check if email already exists
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return handleError(res, 400, "Email Id already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let permissions = [];
    if (role === "admin") {
      permissions = ["all"];
    }

    // Create token
    const token = jwt.sign(
      { email, type, permissions },
      process.env.TOKEN_SECRET
    );

    // Validate user inputs
    const { error } = await registerSchema.validateAsync(req.body);
    if (error) {
      return handleError(res, 400, error);
    }

    // Create a new user
    const user = new User({
      ...req.body,
      password: hashedPassword,
      token,
      permissions,
    });

    // Create a new company
    const company = new Company({
      name: cname,
      createdBy: user._id,
    });

    // Save both user and company concurrently
    await Promise.all([user.save(), company.save()]);

    // Update user with company details
    const existingUser = await User.findById(user._id).exec();
    existingUser.set({ company: cname, companyId: company._id });
    await existingUser.save();

    // Generate verification link
    const encryptedString = cryptr.encrypt(email);
    const link = `${feLink}email-verification/${encryptedString}`;

    // Create a transporter for sending emails
    const transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PWD,
      },
    });

    // Compose email options
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: `Activation mail for Easy CRM`,
      html: verificationEmailTemplate(link),
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return handleError(res, 401, "Mail Error");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({
          status: "200",
          message: "User Created Successfully",
        });
      }
    });
  } catch (error) {
    res.status(500).json({ status: "500", message: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    //CHECKING IF USER EMAIL EXISTS

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res
        .status(200)
        .send({ status: "400", message: "Email doesn't seem to exist" });
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
        .send({ status: "401", message: "User not Verified yet !" });
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
            companyId: user.companyId,
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

      const link = `${feLink}email-verification/${encryptedString}`;
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

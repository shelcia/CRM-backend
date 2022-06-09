//EMPLOYEE DASHBOARD

//EMPLOYEE CAN VIEW

const router = require("express").Router();
const verify = require("./employeeverify");
const ServiceRequest = require("../../models/ServiceRequest");
const Lead = require("../../models/Contacts");
const Contact = require("../../models/Contacts");

//SERVICE REQUEST API'S

//GET

router.get("/servicerequest", verify, async (req, res) => {
  try {
    const tickets = await ServiceRequest.find().exec();
    res.status(200).send(tickets);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//LEAD API'S

//GET

router.get("/lead", verify, async (req, res) => {
  try {
    const leads = await Lead.find().exec();
    res.status(200).send(leads);
  } catch (error) {
    console.log(error);
  }
});

//CONTACT API'S

//GET

router.get("/contact", verify, async (req, res) => {
  try {
    const contacts = await Contact.find().exec();
    res.status(200).send(contacts);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

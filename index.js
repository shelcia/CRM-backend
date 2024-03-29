const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4050;

//IMPORT ROUTES

const authRoute = require("./routes/auth/auth");
const contactsRoute = require("./routes/contacts/contacts");
const usersRoute = require("./routes/user/users");
const companyRoute = require("./routes/company/company");
const adminRoute = require("./routes/adminauth/adminauth");
const managerRoute = require("./routes/managerauth/managerauth");
const employeeRoute = require("./routes/employeeauth/employeeauth");
const adminDashboardRoute = require("./routes/adminauth/adminDashboard");
const managerDashboardRoute = require("./routes/managerauth/managerDashboard");
const employeeDashboardRoute = require("./routes/employeeauth/employeeDashboard");

dotenv.config();

//CONNECTION TO DATABASE

mongoose.connect(process.env.DB_CONNECT, () => console.log("connected to db"));

// mongoose.connect(
//   process.env.DB_CONNECT,
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   () => console.log("Connected to Database")
// );

//MIDDLEWARE
app.use(cors());
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 120 request per 1 minute
    max: 160,
  })
);
app.use(express.json());
app.use(cookieParser());

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/contacts", contactsRoute);
app.use("/api/users", usersRoute);
app.use("/api/company", companyRoute);
app.use("/api/admin", adminRoute);
app.use("/api/manager", managerRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/admindashboard", adminDashboardRoute);
app.use("/api/managerdashboard", managerDashboardRoute);
app.use("/api/employeedashboard", employeeDashboardRoute);

app.get("/", (req, res) => {
  res.send(
    `<a href="https://github.com/shelcia/CRM-backend">This is a backend app , click to open code</a>`
  );
});
app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));

// "start": "nodemon index.js"

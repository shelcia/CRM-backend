const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

//import routes
const authRoute = require("./routes/auth");

dotenv.config();

//connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connected to db  ")
);
//Middleware
app.use(express.json());

//Route Middleware
app.use("/api/users", authRoute);

app.listen(3000, () => console.log("server up and running"));

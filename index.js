const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

//IMPORT ROUTES
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");

dotenv.config();

//CONNECTION TO DATABASE
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connected to db  ")
);

//MIDDLEWARE
app.use(express.json());

//ROUTE MIDDLEWARE
app.use("/api/users", authRoute);
app.use("/api/posts", postRoute);

app.listen(PORT, () => console.log("server up and running"));

// "start": "nodemon index.js"

const router = require("express").Router();
const verify = require("./employeeverify");

router.get("/", verify, (req, res) => {
  //   res.json({ post: { title: "my first post ", description: "you know it" } });
  res.send(req.user);
});

module.exports = router;

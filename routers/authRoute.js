const authCtl = require("../controllers/authCtl");
const router = require("express").Router();

router.post("/reset-password", authCtl.resetPassword);

module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(cors());

const http = require("http").createServer(app);

app.use("/api", require("./routers/authRoute"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const port = 3000;
http.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

require("dotenv").config();
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const queryString = require("query-string");
const nodemailer = require("nodemailer");

function sendEmail(message) {
  return new Promise((res, rej) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    transporter.sendMail(message, function (err, info) {
      if (err) {
        rej(err);
      } else {
        res(info);
      }
    });
  });
}

function sendResetPassword({ toUser, pass }) {
  const message = {
    from: process.env.GOOGLE_USER,
    to: toUser.email,
    // to: process.env.GOOGLE_USER,
    subject: "PNV - Reset Password",
    html: `
        <h3>Chào ${toUser.name} </h3>
        <p>Password mới của bạn là <strong>${pass}</strong></p>
        <p>Cheers,</p>
        <p>PNV</p>    
      `,
  };

  return sendEmail(message);
}

// exports.sendResetPassword = function ({ toUser, pass }) {
//   const message = {
//     from: process.env.GOOGLE_USER,
//     to: toUser.email,
//     // to: process.env.GOOGLE_USER,
//     subject: "PNV - Reset Password",
//     html: `
//         <h3>Chào ${toUser.name} </h3>
//         <p>Password mới của bạn là <strong>${pass}</strong></p>
//         <p>Cheers,</p>
//         <p>PNV</p>
//       `,
//   };

//   return sendEmail(message);
// };

server.use(middlewares);
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
    "/blog/:resource/:id/show": "/:resource/:id",
  })
);

server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  } else if (req.method === "PATCH" || req.method === "PUT") {
    req.body.updatedAt = Date.now();
  }
  next();
});

// server.use((req, res, next) => {
//   if (req.method === "PATCH" && req.body.key === "RESET") {
//     console.log(req.body);
//   }
//   next();
// });

server.post("/reset", async (req, res) => {
  const { email } = req.body;
  const pass = "112233";
  const user = {
    name: "Thanh",
    email,
  };
  await sendResetPassword({ toUser: user, pass });
  res.jsonp({ message: "helo" });
});

router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCount = headers["x-total-count"];
  if (req.originalMethod === "GET" && totalCount) {
    const queryParams = queryString.parse(req._parsedOriginalUrl.query);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 10,
        _totalRows: Number.parseInt(totalCount),
      },
    };
    return res.jsonp(result);
  }
  res.jsonp(res.locals.data);
};

server.use(router);
server.listen(4002, () => {
  console.log("JSON Server is running");
});

module.exports = server;

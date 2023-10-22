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

server.post("/payment", async (req, res) => {
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = partnerCode + new Date().getTime() + "id";
  var orderId = new Date().getTime() + ":0123456778";
  var orderInfo = "Thanh toán qua ví MoMo";
  var redirectUrl = "http://127.0.0.1:5500/index.html";
  var ipnUrl = "http://127.0.0.1:5500/index.html";
  // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
  var amount = "50000";
  var requestType = "payWithATM";
  // var requestType = "captureWallet";
  var extraData = ""; //pass empty value if your merchant does not have stores

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });
  //Create the HTTPS objects
  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };
  //Send the request and get the response
  const reqq = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (body) => {
      console.log("Body: ");
      console.log(body);
      console.log("payUrl: ");
      console.log(JSON.parse(body).payUrl);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  reqq.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....");
  reqq.write(requestBody);
  reqq.end();
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

//momo

server.use(router);
server.listen(4002, () => {
  console.log("JSON Server is running");
});

module.exports = server;

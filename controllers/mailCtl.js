const nodemailer = require("nodemailer");

function sendEmail(message) {
  return new Promise((res, rej) => {
    console.log(process.env.GOOGLE_USER);
    console.log(process.env.GOOGLE_PASSWORD);
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

exports.sendResetPassword = function ({ toUser, pass }) {
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
};

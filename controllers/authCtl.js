const { sendResetPassword } = require("./mailCtl");

const authCtl = {
  resetPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const pass = "112233";
      const user = {
        name: "Thanh",
        email,
      };
      await sendResetPassword({ toUser: user, pass });
      res.json();
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = authCtl;

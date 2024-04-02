const OTP_TEMPLATE = require("./OTP");
const RESET_PASSWORD_TEMPLATE = require("./ResetPassword");
const gethtml = (key, data) => {
  if (key === "reset_password") {
    return RESET_PASSWORD_TEMPLATE(data.resetURL, data.userName);
  }
  if (key === "new_otp") {
    return OTP_TEMPLATE(data.new_otp, data.userName);
  }
};

module.exports = gethtml;

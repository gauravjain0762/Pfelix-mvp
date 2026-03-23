const transporter = require("../config/email");

exports.sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"Pfelix App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
};
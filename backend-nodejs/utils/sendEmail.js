const nodemailer = require('nodemailer'); // Import library to send emails

// Async function to send emails
// Using 'options' object: { email: "who@to.com", subject: "Subject", message: "Plain text", html: "HTML version" }
const sendEmail = async (options) => {
  // 1) Create a transporter
  // Think of 'transporter' as the postman or the email service provider connection.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. smtp.gmail.com or smtp.ethereal.email (for testing)
    port: process.env.EMAIL_PORT, // e.g. 587 (standard secure port)
    auth: {
      user: process.env.EMAIL_USER, // Your email username
      pass: process.env.EMAIL_PASS  // Your email password
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: '"Multaqana Support" <support@multaqana.com>', // Sender address (visible to user)
    to: options.email, // Receiver address
    subject: options.subject, // Subject line
    text: options.message, // Plain text body (fallback for old email clients)
    html: options.html // HTML body (for fancy emails)
  };

  // 3) Actually send the email
  // This is asynchronous because it takes time to talk to the email server.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

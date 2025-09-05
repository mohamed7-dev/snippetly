import nodemailer from "nodemailer";

const credentials = {
  email: process.env.GMAIL_APP_EMAIL,
  password: process.env.GMAIL_APP_PASSWORD,
};

if (!credentials.email || !credentials.password) {
  throw new Error(
    "Missing GMAIL_APP_EMAIL or GMAIL_APP_PASSWORD Env Variables."
  );
}

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: credentials.email,
    pass: credentials.password,
  },
});

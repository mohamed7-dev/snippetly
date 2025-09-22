import nodemailer from "nodemailer";
import { ServerLogger } from "../common/logger/index.ts";

const credentials = {
  email: process.env.GMAIL_APP_EMAIL,
  password: process.env.GMAIL_APP_PASSWORD,
};

if (!credentials.email || !credentials.password) {
  ServerLogger.logShutdown(
    "Missing GMAIL_APP_EMAIL or GMAIL_APP_PASSWORD Env Variables."
  );
  process.exit(0);
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

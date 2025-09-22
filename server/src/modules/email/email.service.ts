import { APP_NAME } from "../../config/index.ts";
import { transporter } from "../../config/nodemailer.config.ts";
import { readTemplate } from "./lib/utils.ts";

export class EmailService {
  static async sendVerificationEmail({
    email,
    username,
    callbackUrl,
  }: {
    email: string;
    username: string;
    callbackUrl: string;
  }) {
    const template = readTemplate("verification.template.html");
    const mailOptions = {
      from: process.env.GMAIL_APP_EMAIL,
      to: email,
      subject: `Verify your email - ${APP_NAME}`,
      html: template
        .replace("{{name}}", username)
        .replace(/{{verificationUrl}}/g, callbackUrl)
        .replace("{{year}}", new Date().getFullYear().toString()),
      // html: `
      //         <div>
      //           <h1>hello, ${username}</h1>
      //           <p>
      //               Click this link to <a href= >verify your email</a>!
      //               Copy this code ${token} and paste it into the verification token field in your email verification page.
      //           </p>
      //         </div>
      //     `,
    };
    return await transporter.sendMail(mailOptions);
  }
  static async sendResetEmail({
    email,
    username,
    callbackUrl,
  }: {
    email: string;
    username: string;
    callbackUrl: string;
  }) {
    const template = readTemplate("reset.template.html");

    const mailOptions = {
      from: process.env.GMAIL_APP_EMAIL,
      to: email,
      subject: `Reset your password - ${APP_NAME}`,
      html: template
        .replace("{{name}}", username)
        .replace(/{{resetUrl}}/g, callbackUrl)
        .replace("{{year}}", new Date().getFullYear().toString()),
      // html: `
      //         <div>
      //           <h1>hello, ${username}</h1>
      //           <p>
      //               Copy this code ${token} and paste it into the reset password token field in your reset password form.
      //           </p>
      //         </div>
      //     `,
    };
    return await transporter.sendMail(mailOptions);
  }
}

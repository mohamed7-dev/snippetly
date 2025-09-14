import { transporter } from "../../config/nodemailer.config";

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
    const mailOptions = {
      from: process.env.GMAIL_APP_EMAIL,
      to: email,
      subject: "Verify you email",
      html: `
              <div>
                <h1>hello, ${username}</h1>
                <p>
                    click this link to <a href="${callbackUrl}" target="_blank">Verify your account</a>
                </p>
              </div>
          `,
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
    const mailOptions = {
      from: process.env.GMAIL_APP_EMAIL,
      to: email,
      subject: "Reset your password",
      html: `
              <div>
                <h1>hello, ${username}</h1>
                <p>
                    click this link to <a href="${callbackUrl}" target="_blank">Reset your password</a>.
                </p>
              </div>
          `,
    };
    return await transporter.sendMail(mailOptions);
  }
}

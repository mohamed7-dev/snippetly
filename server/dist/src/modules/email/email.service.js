import { APP_NAME } from "../../config/index.js";
import { transporter } from "../../config/nodemailer.config.js";
import { readTemplate } from "./lib/utils.js";
export class EmailService {
    static async sendVerificationEmail({ email, username, callbackUrl }) {
        const template = readTemplate("verification.template.html");
        const mailOptions = {
            from: process.env.GMAIL_APP_EMAIL,
            to: email,
            subject: `Verify your email - ${APP_NAME}`,
            html: template.replace("{{name}}", username).replace(/{{verificationUrl}}/g, callbackUrl).replace("{{year}}", new Date().getFullYear().toString())
        };
        return await transporter.sendMail(mailOptions);
    }
    static async sendResetEmail({ email, username, callbackUrl }) {
        const template = readTemplate("reset.template.html");
        const mailOptions = {
            from: process.env.GMAIL_APP_EMAIL,
            to: email,
            subject: `Reset your password - ${APP_NAME}`,
            html: template.replace("{{name}}", username).replace(/{{resetUrl}}/g, callbackUrl).replace("{{year}}", new Date().getFullYear().toString())
        };
        return await transporter.sendMail(mailOptions);
    }
}

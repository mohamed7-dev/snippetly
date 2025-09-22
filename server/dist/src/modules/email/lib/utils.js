import fs from "fs";
import path from "path";
import { __dirname } from "../../../common/lib/utils.js";
export function readTemplate(templateName) {
    const templatePath = path.join(__dirname, "..", "templates", templateName);
    let emailTemplate = fs.readFileSync(templatePath, "utf8");
    return emailTemplate;
}

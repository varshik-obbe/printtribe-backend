import fs from "fs";
import Handlebars from "handlebars";
import NodeMailer from "nodemailer";
import { promisify } from "util";

export default async function (name,email,link) {
    try {
        const readFile = promisify(fs.readFile);
        let transporter = NodeMailer.createTransport({
            host: process.env.EMAIL_SMTP_HOST,
            port: process.env.EMAIL_SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_USERNAME, // generated ethereal user
              pass: process.env.EMAIL_PASSWORD, // generated ethereal password
            },
          });

          let html = await readFile("./uploads/forgotPass_mail.html", 'utf-8');
          let template = Handlebars.compile(html);
          let data = {
            name: name,
            link: link
        };

        let htmlToSend = template(data);
    
          let info = await transporter.sendMail({
            from: '"Printribe" <'+process.env.EMAIL_USERNAME+'>', // sender address
            to: email, // list of receivers
            subject: "Forgot Password", // Subject line
            html: htmlToSend, // html body
          })
          .then((success) => console.log("mail sent successfully"))
          .catch((err) => {
              console.log("error is "+err)
          })
    }
    catch {
        console.log("ran into an error");
    }
}
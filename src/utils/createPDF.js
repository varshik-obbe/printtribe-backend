import fs from "fs";
import Handlebars from "handlebars";
import pdf from "html-pdf";
import { promisify } from "util";


export default async function(customer_name) {
    try {
        const readFile = promisify(fs.readFile);

          let html = await readFile("./uploads/invoice_template.html", 'utf-8');
          let template = Handlebars.compile(html);
          let data = {
            cust_name: customer_name
        };

        let htmlToSend = template(data);

        let pdfName = customer_name + Date.now().toString();

        let createdData = await pdfCreating(htmlToSend,pdfName);

        if(createdData != "") {
            return pdfName;
        }
        else {
            return pdfName;
        }
    }
    catch(err) {
        let pfName = "";
        console.log("ran into an error"+err);
        return pfName;
    }
}

async function pdfCreating(htmlData,pdfName) {
 return new Promise((resolve,reject) => {
    pdf.create(htmlData, {"format": "A4" }).toFile('./uploads/'+pdfName+".pdf", function (err, pdf) {

        if(err) {
            console.log("error occured while generating")
            pdfName = "";
            reject(pdfName)
        }
        else {
            console.log("uploaded successfully"+pdf.filename)
            fs.existsSync('/uploads'+pdf.filename);
            resolve(pdfName);
        }
    })
 })
}
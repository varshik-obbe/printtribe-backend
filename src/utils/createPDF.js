import fs from "fs";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";
import { promisify } from "util";


export default async function(customer_name,address,zipcode,shipping_charges,state,state_code,email,phone,invoice_no,city) {
    try {
        const readFile = promisify(fs.readFile);

          let html = await readFile("./uploads/invoice_template.html", 'utf-8');
          let template = Handlebars.compile(html);

          const nDate = new Date();

          let dateAdd = nDate.getDate() + '-' + nDate.getMonth() + '-' + nDate.getFullYear();

          let data = {
            cust_name: customer_name,
            date_set: dateAdd.toString(),
            invoice_no: invoice_no,
            address: address,
            zipcode: zipcode,
            state: state,
            state_code: state_code,
            email_id: email,
            phone: phone,
            city: city
        };

        let htmlToSend = template(data);

        let pdfName = customer_name + Date.now().toString();

          // launch a new chrome instance
  const browser = await puppeteer.launch({args: ['--no-sandbox']})

  // create a new page
  const page = await browser.newPage()

  // set your html as the pages content
  await page.setContent(htmlToSend, {
    waitUntil: 'domcontentloaded'
  })

  // create a pdf buffer
  const pdfBuffer = await page.pdf({
    format: 'A4'
  })

  // or a .pdf file
  await page.pdf({
    // width: '35cm',
    // height: '30cm',
    format: 'A4',
    margin: {
        top: '2px',
        bottom: '2px',
        left: '2px',
        right: '2px',
    },
    path: `./uploads/`+pdfName+`.pdf`
  })

  // close the browser
  await browser.close()

  return pdfName;

        // let createdData = await pdfCreating(htmlToSend,pdfName);

        // if(createdData != "") {
        //     return pdfName;
        // }
        // else {
        //     return pdfName;
        // }
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